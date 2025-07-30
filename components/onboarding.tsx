"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { IMAGE_MODELS, DEFAULT_TEXT_MODELS } from '@/components/settings'
import { themes } from '@/lib/themes'
import { useTheme } from '@/lib/theme-context'

const steps = ['name', 'theme', 'systemPrompt', 'textModel', 'imageModel']

const systemPromptOptions = [
  {
    name: "Default Assistant",
    value: "You are an AI assistant named Arc. You help users with their queries. Respond to User only in Markdown."
  },
  {
    name: "Creative Writer",
    value: "You are a creative AI assistant named Arc. You excel at storytelling, creative writing, and imaginative content. Respond to User only in Markdown."
  },
  {
    name: "Technical Expert",
    value: "You are a technical AI assistant named Arc. You specialize in programming, mathematics, and technical explanations. Use code blocks and mathematical notation when appropriate. Respond to User only in Markdown."
  },
  {
    name: "Custom",
    value: ""
  }
]

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [selectedTheme, setSelectedTheme] = useState('default')
  const [systemPrompt, setSystemPrompt] = useState(systemPromptOptions[0].value)
  const [customSystemPrompt, setCustomSystemPrompt] = useState('')
  const [textModel, setTextModel] = useState('openai-fast')
  const [imageModel, setImageModel] = useState('')
  const [textModels, setTextModels] = useState<string[]>(["openai-fast", "openai", "phi"])
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
            setTextModels(data.map((model: any) => model.name || model).filter((m: string) => ["openai", "openai-fast", "phi"].includes(m)));
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
    const finalSystemPrompt = systemPrompt === "" ? customSystemPrompt : systemPrompt;
    localStorage.setItem('profileName', name)
    localStorage.setItem('theme', selectedTheme)
    localStorage.setItem('systemPrompt', finalSystemPrompt)
    localStorage.setItem('textModel', textModel || 'openai-fast')
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

  const handleSystemPromptChange = (value: string) => {
    setSystemPrompt(value)
    if (value !== "") {
      setCustomSystemPrompt('')
    }
  }

  const isStepValid = () => {
    switch (step) {
      case 0: return name.trim() !== ''
      case 1: return selectedTheme !== ''
      case 2: return systemPrompt !== "" || customSystemPrompt.trim() !== ''
      case 3: return textModel !== ''
      case 4: return imageModel !== ''
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
            <Label className="text-white">Choose a System Prompt</Label>
            <div className="space-y-2">
              {systemPromptOptions.map((option) => (
                <Button
                  key={option.name}
                  variant={systemPrompt === option.value ? "default" : "outline"}
                  onClick={() => handleSystemPromptChange(option.value)}
                  className="w-full justify-start"
                >
                  {option.name}
                </Button>
              ))}
            </div>
            {systemPrompt === "" && (
              <div className="space-y-2">
                <Label className="text-white">Custom System Prompt</Label>
                <Textarea
                  value={customSystemPrompt}
                  onChange={(e) => setCustomSystemPrompt(e.target.value)}
                  placeholder="Enter your custom system prompt..."
                  className="bg-zinc-800 text-white min-h-[100px]"
                />
              </div>
            )}
          </div>
        )}
        {step === 3 && (
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
        {step === 4 && (
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

