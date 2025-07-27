"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { IMAGE_MODELS, DEFAULT_TEXT_MODELS, THEME_COLORS } from '@/components/settings'

const steps = ['name', 'systemPrompt', 'textModel', 'imageModel', 'appearance', 'theme']

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
  const [systemPrompt, setSystemPrompt] = useState(systemPromptOptions[0].value)
  const [customSystemPrompt, setCustomSystemPrompt] = useState('')
  const [textModel, setTextModel] = useState('')
  const [imageModel, setImageModel] = useState('')
  const [selectedTheme, setSelectedTheme] = useState('blue')
  const [textModels, setTextModels] = useState<string[]>(DEFAULT_TEXT_MODELS)
  const [isLoadingModels, setIsLoadingModels] = useState(false)

  useEffect(() => {
    const fetchModels = async () => {
      setIsLoadingModels(true);
      try {
        const response = await fetch('/api/models');
        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data)) {
            setTextModels(data.map((model: any) => model.name || model));
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
    localStorage.setItem('systemPrompt', finalSystemPrompt)
    localStorage.setItem('textModel', textModel)
    localStorage.setItem('imageModel', imageModel)
    localStorage.setItem('theme', selectedTheme)
    localStorage.setItem('onboardingComplete', 'true')
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
      case 1: return systemPrompt !== "" || customSystemPrompt.trim() !== ''
      case 2: return textModel !== ''
      case 3: return imageModel !== ''
      case 4: return true // Appearance step is always valid
      case 5: return selectedTheme !== ''
      default: return false
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/80 via-purple-900/20 to-blue-900/20 backdrop-blur-xl"
    >
      <motion.div 
        className="bg-gradient-to-br from-zinc-900/95 via-zinc-800/90 to-zinc-900/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl max-w-md w-full border border-zinc-700/50 relative overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl"></div>
        <div className="relative z-10">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-2 text-white">Welcome to ArcGPT</h2>
          <p className="text-gray-400 text-sm">Let's personalize your experience</p>
        </div>
        {step === 0 && (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <Label htmlFor="name" className="text-white text-lg font-semibold">What's your name?</Label>
            </div>
            <motion.div
              className="relative"
              whileFocus={{ scale: 1.02 }}
            >
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="bg-gradient-to-r from-zinc-800/50 to-zinc-700/50 text-white border-zinc-600 focus:border-blue-500 focus:ring-blue-500/30 rounded-2xl py-4 text-center text-lg shadow-lg backdrop-blur-sm transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10 rounded-2xl pointer-events-none"></div>
            </motion.div>
          </motion.div>
        )}
        {step === 1 && (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <Label className="text-white text-lg font-semibold">Choose Your AI Personality</Label>
              <p className="text-gray-400 text-sm mt-2">Select how Arc should behave</p>
            </div>
            <div className="space-y-3">
              {systemPromptOptions.map((option, index) => (
                <motion.button
                  key={option.name}
                  onClick={() => handleSystemPromptChange(option.value)}
                  className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden ${
                    systemPrompt === option.value
                      ? 'border-blue-500 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white shadow-lg shadow-blue-500/25'
                      : 'border-zinc-700 bg-gradient-to-r from-zinc-800/50 to-zinc-700/50 text-gray-300 hover:border-zinc-600 hover:bg-zinc-800/70'
                  }`}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5"></div>
                  <div className="relative z-10">
                    <div className="font-semibold text-lg">{option.name}</div>
                    {option.value && (
                      <div className="text-xs text-gray-400 mt-2 line-clamp-2">
                        {option.value.length > 60 ? option.value.substring(0, 60) + '...' : option.value}
                      </div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
            {systemPrompt === "" && (
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <Label className="text-white font-semibold">Custom System Prompt</Label>
                <Textarea
                  value={customSystemPrompt}
                  onChange={(e) => setCustomSystemPrompt(e.target.value)}
                  placeholder="Enter your custom system prompt..."
                  className="bg-zinc-800/50 text-white border-zinc-700 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl min-h-[120px] resize-none"
                />
              </motion.div>
            )}
          </motion.div>
        )}
        {step === 2 && (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <Label className="text-white text-lg font-semibold">Choose Your Text Model</Label>
              <p className="text-gray-400 text-sm mt-2">Select the AI model for text generation</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {isLoadingModels ? (
                <div className="col-span-2 text-center text-white py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  Loading models...
                </div>
              ) : (
                textModels.map((model, index) => (
                  <motion.button
                    key={model}
                    onClick={() => setTextModel(model)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden ${
                      textModel === model
                        ? 'border-blue-500 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white shadow-lg shadow-blue-500/25'
                        : 'border-zinc-700 bg-gradient-to-r from-zinc-800/50 to-zinc-700/50 text-gray-300 hover:border-zinc-600 hover:bg-zinc-800/70'
                    }`}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5"></div>
                    <div className="relative z-10 font-semibold text-sm">{model}</div>
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        )}
        {step === 3 && (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <Label className="text-white text-lg font-semibold">Choose Your Image Model</Label>
              <p className="text-gray-400 text-sm mt-2">Select the AI model for image generation</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {IMAGE_MODELS.map((model, index) => (
                <motion.button
                  key={model}
                  onClick={() => setImageModel(model)}
                  className={`p-4 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden ${
                    imageModel === model
                      ? 'border-blue-500 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white shadow-lg shadow-blue-500/25'
                      : 'border-zinc-700 bg-gradient-to-r from-zinc-800/50 to-zinc-700/50 text-gray-300 hover:border-zinc-600 hover:bg-zinc-800/70'
                  }`}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5"></div>
                  <div className="relative z-10 font-semibold text-sm">{model}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
        {step === 4 && (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <Label className="text-white text-lg font-semibold">Choose Your Appearance</Label>
              <p className="text-gray-400 text-sm mt-2">Customize how ArcGPT looks and feels</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                className="p-6 rounded-2xl border-2 border-zinc-700 bg-gradient-to-br from-zinc-800/50 to-zinc-700/50 text-center cursor-pointer hover:border-zinc-600 hover:bg-zinc-800/70 transition-all duration-300 relative overflow-hidden"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <span className="text-white text-2xl">🌙</span>
                  </div>
                  <h3 className="text-white font-semibold mb-2 text-lg">Dark Mode</h3>
                  <p className="text-gray-400 text-sm">Elegant dark interface</p>
                </div>
              </motion.div>
              <motion.div
                className="p-6 rounded-2xl border-2 border-zinc-700 bg-gradient-to-br from-zinc-800/50 to-zinc-700/50 text-center cursor-pointer hover:border-zinc-600 hover:bg-zinc-800/70 transition-all duration-300 relative overflow-hidden"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-orange-500/10"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <span className="text-white text-2xl">☀️</span>
                  </div>
                  <h3 className="text-white font-semibold mb-2 text-lg">Light Mode</h3>
                  <p className="text-gray-400 text-sm">Clean light interface</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
        {step === 5 && (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <Label className="text-white text-lg font-semibold">Choose Your Theme</Label>
              <p className="text-gray-400 text-sm mt-2">Personalize your ArcGPT experience</p>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {THEME_COLORS.map((theme, index) => (
                <motion.button
                  key={theme.value}
                  onClick={() => setSelectedTheme(theme.value)}
                  className={`h-16 w-full rounded-xl border-2 transition-all duration-300 relative overflow-hidden ${
                    selectedTheme === theme.value
                      ? 'border-white scale-110 shadow-2xl'
                      : 'border-gray-600 hover:border-gray-400 hover:scale-105'
                  } ${theme.class}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={theme.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-sm drop-shadow-lg">{theme.name}</span>
                  </div>
                  {selectedTheme === theme.value && (
                    <motion.div
                      className="absolute top-1 right-1"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <motion.div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: theme.value === 'blue' ? '#2563eb' : 
                                                   theme.value === 'red' ? '#dc2626' :
                                                   theme.value === 'green' ? '#16a34a' :
                                                   theme.value === 'purple' ? '#9333ea' :
                                                   theme.value === 'orange' ? '#ea580c' :
                                                   theme.value === 'pink' ? '#db2777' :
                                                   theme.value === 'teal' ? '#0d9488' :
                                                   theme.value === 'indigo' ? '#4f46e5' : '#2563eb' }}
                        />
                      </div>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
            <motion.div 
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-gray-400 text-sm font-medium">
                {selectedTheme === 'blue' && "Classic and professional"}
                {selectedTheme === 'red' && "Bold and energetic"}
                {selectedTheme === 'green' && "Fresh and natural"}
                {selectedTheme === 'purple' && "Creative and mysterious"}
                {selectedTheme === 'orange' && "Warm and friendly"}
                {selectedTheme === 'pink' && "Playful and vibrant"}
                {selectedTheme === 'teal' && "Calm and balanced"}
                {selectedTheme === 'indigo' && "Deep and sophisticated"}
              </p>
            </motion.div>
          </motion.div>
        )}
        <div className="mt-8 space-y-4">
          {/* Step indicators */}
          <div className="flex justify-center space-x-3">
            {steps.map((_, index) => (
              <motion.div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-500 ${
                  index <= step 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/50' 
                    : 'bg-gray-600'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.2 }}
              />
            ))}
          </div>
          
          <motion.div
            className="relative"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl relative overflow-hidden"
              disabled={!isStepValid()}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 animate-pulse"></div>
              <span className="relative z-10">{step < steps.length - 1 ? 'Continue' : 'Get Started'}</span>
            </Button>
          </motion.div>
        </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

