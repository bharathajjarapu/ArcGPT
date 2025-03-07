"use client"

import { useState, useEffect } from 'react';

const PROMPT_SUGGESTIONS = [
  "Make an Image of close-up portrait of Hacker",
  "Find the Integral & Derivative of sin(3x)dx",
  "Explain AI & Neural Networks with Math",
  "@search Latest News Updates from Hyderabad",
  "@code Write Code for Palindrome in Python",
  "@imagine Cinematic Shot of Skies of Pandora",
]
type PromptSuggestion = {
  text: string
  onClick: (text: string) => void
}
export function PromptSuggestions({ greeting, onSelect }: { 
  greeting: string
  onSelect: (text: string) => void 
}) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize(); 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  if (isMobile) {
    return null;
  }
  return (
    <div className="pt-20 pl-20 pr-20">
      <h2 className="text-5xl font-bold text-center mb-4">
        {greeting}
      </h2>
      <div className="pt-10 grid grid-cols-1 md:grid-cols-3 gap-4 flex">
        {PROMPT_SUGGESTIONS.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(suggestion)}
            className="h-max flex-1 rounded-xl border bg-background p-4 hover:bg-muted border-gray-700/50"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}

