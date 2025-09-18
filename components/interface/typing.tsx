import React from 'react'
import { cn } from "@/lib/utils"

export function TypingIndicator() {
  return (
    <div className="flex items-center space-x-2 p-2 bg-muted rounded-lg border border-border/50">
      <div className="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  )
}

const styles = `
  .typing-indicator {
    display: flex;
    align-items: center;
  }

  .typing-indicator span {
    height: 8px;
    width: 8px;
    background-color: hsl(var(--foreground));
    border-radius: 50%;
    display: inline-block;
    margin-right: 4px;
    opacity: 0.4;
  }

  .typing-indicator span:nth-child(1) {
    animation: pulse 1s infinite ease-in-out;
  }

  .typing-indicator span:nth-child(2) {
    animation: pulse 1s infinite ease-in-out 0.2s;
  }

  .typing-indicator span:nth-child(3) {
    animation: pulse 1s infinite ease-in-out 0.4s;
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 0.4;
    }
    50% {
      transform: scale(1.2);
      opacity: 1;
    }
  }
`

if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style')
  styleElement.textContent = styles
  document.head.appendChild(styleElement)
}

