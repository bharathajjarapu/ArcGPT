"use client"

import { Button } from "@/components/ui/button"
import {
  SidebarIcon,
  Trash2,
  GitForkIcon,
  SettingsIcon,
} from "lucide-react"

type ChatHeaderProps = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  onNewChat: () => void
  onClearChat: () => void
  onFork: () => void
  onSettingsOpen: () => void
  hasMessages: boolean
}

export function ChatHeader({
  isOpen,
  setIsOpen,
  onNewChat,
  onClearChat,
  onFork,
  onSettingsOpen,
  hasMessages
}: ChatHeaderProps) {
  return (
    <header className="flex items-center pt-3 pb-0.8 px-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="mr-2"
      >
        <SidebarIcon className="h-6 w-6" />
      </Button>
      <button
        onClick={() => {
          if (hasMessages) {
            onNewChat()
          }
        }}
        className="text-xl font-semibold select-none hover:opacity-90 active:opacity-80 transition-opacity"
        title="New Chat"
      >
        ArcGPT
      </button>
      <div className="ml-auto flex items-center">
        <Button variant="ghost" size="icon" onClick={onClearChat} className="mr-2">
          <Trash2 className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onFork} className="mr-2">
          <GitForkIcon className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onSettingsOpen}
          className=""
        >
          <SettingsIcon className="h-6 w-6" />
        </Button>
      </div>
    </header>
  )
}
