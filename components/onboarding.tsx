"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IMAGE_MODELS } from '@/components/settings'
import { themes } from '@/lib/themes'
import { useTheme } from '@/lib/theme-context'

const steps = ['name', 'theme', 'textModel', 'imageModel']

// System prompt selection was removed from onboarding. We keep a single default.
const DEFAULT_SYSTEM_PROMPT =
  "You are an AI assistant named Arc. You help users with their queries. Respond to User only in Markdown.";

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [selectedTheme, setSelectedTheme] = useState('default')
  const [textModel, setTextModel] = useState('openai-fast')
  const [imageModel, setImageModel] = useState('')
  const [textModels, setTextModels] = useState<string[]>(["openai", "mistral", "gpt-5-nano"])
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const { setTheme } = useTheme()

  // Apply theme preview when user selects a theme
  useEffect(() => {
    if (selectedTheme) {
      setTheme(selectedTheme);
    }
  }, [selectedTheme, setTheme]);

  useEffect(() => {
    const fetchModels = async () => {
      setIsLoadingModels(true);
      try {
        const response = await fetch('/api/models');
        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data)) {
            // Always show all requested models regardless of API response
            const requestedModels = ["openai", "mistral", "gpt-5-nano"];
            setTextModels(requestedModels);
          }
        }
      } catch (error) {
        console.error('Error fetching models:', error);
        // Keep default models as fallback
      } finally {
        setIsLoadingModels(false);
      }
    };

    fetchModels();
  }, []);

  const handleComplete = () => {
    const finalSystemPrompt = DEFAULT_SYSTEM_PROMPT;
    localStorage.setItem('profileName', name)
    localStorage.setItem('theme', selectedTheme)
    localStorage.setItem('systemPrompt', finalSystemPrompt)
    localStorage.setItem('textModel', textModel || 'openai')
    localStorage.setItem('imageModel', imageModel)
    localStorage.setItem('onboardingComplete', 'true')
    setTheme(selectedTheme)
    onComplete()
  }

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      handleComplete()
    }
  }

  // System prompt selection removed; no-op handlers deleted

  const isStepValid = () => {
    switch (step) {
      case 0: return name.trim() !== ''
      case 1: return selectedTheme !== ''
      case 2: return textModel !== ''
      case 3: return imageModel !== ''
      default: return false
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div className="bg-zinc-900 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-white">Welcome to ArcGPT</h2>
        {step === 0 && (
          <div className="space-y-4">
            <Label htmlFor="name" className="text-white">What's your name?</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="bg-zinc-800 text-white"
            />
          </div>
        )}
        {step === 1 && (
          <div className="space-y-4">
            <Label className="text-white">Choose a Theme</Label>
            <div className="theme-grid">
              {themes.map((theme) => (
                <div
                  key={theme.name}
                  className={`theme-preview theme-${theme.name} ${
                    selectedTheme === theme.name ? 'selected' : ''
                  }`}
                  onClick={() => setSelectedTheme(theme.name)}
                >
                  {selectedTheme === theme.name && (
                    <span className="theme-preview-tick">
                      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 10.5L9 14.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <Label className="text-white">Choose a Text Model</Label>
            <div className="flex flex-wrap gap-2">
              {isLoadingModels ? (
                <div className="text-white">Loading models...</div>
              ) : (
                textModels.map((model) => (
                  <Button
                    key={model}
                    variant={textModel === model ? "default" : "outline"}
                    onClick={() => setTextModel(model)}
                    className="rounded-md"
                  >
                    {model}
                  </Button>
                ))
              )}
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <Label className="text-white">Choose an Image Model</Label>
            <div className="flex flex-wrap gap-2">
              {IMAGE_MODELS.map((model) => (
                <Button
                  key={model}
                  variant={imageModel === model ? "default" : "outline"}
                  onClick={() => setImageModel(model)}
                  className="rounded-md"
                >
                  {model}
                </Button>
              ))}
            </div>
          </div>
        )}
        <Button
          onClick={handleNext}
          className="mt-6 w-full"
          disabled={!isStepValid()}
        >
          {step < steps.length - 1 ? 'Next' : 'Get Started'}
        </Button>
      </div>
    </motion.div>
  )
}

