"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TEXT_MODELS, IMAGE_MODELS } from '@/components/settings'

const steps = ['name', 'textModel', 'imageModel']

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [textModel, setTextModel] = useState('')
  const [imageModel, setImageModel] = useState('')

  const handleComplete = () => {
    localStorage.setItem('profileName', name)
    localStorage.setItem('textModel', textModel)
    localStorage.setItem('imageModel', imageModel)
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
            <Label className="text-white">Choose a Text Model</Label>
            <div className="flex flex-wrap gap-2">
              {TEXT_MODELS.map((model) => (
                <Button
                  key={model}
                  variant={textModel === model ? "default" : "outline"}
                  onClick={() => setTextModel(model)}
                  className="rounded-md"
                >
                  {model}
                </Button>
              ))}
            </div>
          </div>
        )}
        {step === 2 && (
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
          disabled={(step === 0 && !name) || (step === 1 && !textModel) || (step === 2 && !imageModel)}
        >
          {step < steps.length - 1 ? 'Next' : 'Get Started'}
        </Button>
      </div>
    </motion.div>
  )
}

