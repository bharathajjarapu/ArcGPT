"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  SidebarIcon,
  ArrowUp,
  User,
  Bot,
  SettingsIcon,
  Trash2,
  GitForkIcon,
  Mic,
  Search,
  Code,
  ImageIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Message } from "@/types/chat"
import { sendMessage } from "@/app/chat"
import { TypingIndicator } from "@/components/interface/typing"
import { CopyButton } from "@/components/interface/copy"
import { PromptSuggestions } from "@/components/interface/prompts"
import { MarkdownRenderer } from "@/components/interface/markdown"
import { getCurrentTimeAndDate } from "@/app/time"
import { Settings } from "./settings"

type ChatProps = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  activeChatId: string
  onFork: () => void
}

export default function Chat({ isOpen, setIsOpen, activeChatId, onFork }: ChatProps) {
  const [conversationHistory, setConversationHistory] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [greeting, setGreeting] = useState("")
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState("")
  const [selectedTextModel, setSelectedTextModel] = useState(() => localStorage.getItem("textModel") || "openai-fast")
  const [selectedImageModel, setSelectedImageModel] = useState(() => localStorage.getItem("imageModel") || "flux")
  const [selectedTheme, setSelectedTheme] = useState(() => localStorage.getItem("theme") || "blue")

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [textareaRef])

  useEffect(() => {
    const { formattedTime, formattedDate, currentGreeting } = getCurrentTimeAndDate()
    const savedProfileName = localStorage.getItem("profileName") || "User"
    setGreeting(`${currentGreeting} ${savedProfileName}`)

    const savedSystemPrompt = localStorage.getItem("systemPrompt")
    const savedTextModel = localStorage.getItem("textModel")
    const savedImageModel = localStorage.getItem("imageModel")
    const savedTheme = localStorage.getItem("theme")

    if (savedSystemPrompt) {
      setSystemPrompt(savedSystemPrompt)
    }
    if (savedTextModel) {
      setSelectedTextModel(savedTextModel)
    }
    if (savedImageModel) {
      setSelectedImageModel(savedImageModel)
    }
    if (savedTheme) {
      setSelectedTheme(savedTheme)
    }

    const baseSystemPrompt = `You are an AI assistant named Arc. You help users with their queries. Respond to users only in Markdown format.

IMPORTANT IMAGE GENERATION FORMATTING RULES:
- When asked to generate, create, make, or show an image, ALWAYS use this exact format:
  ![Generated Image](https://pollinations.ai/p/${encodeURIComponent('{PROMPT}')}?width=512&height=512&nologo=true&model=${selectedImageModel})
- Replace {PROMPT} with the actual image description
- Always use 512x512 dimensions for consistency
- Never use any other image format or URL structure
- If the user asks for multiple images, create separate markdown image blocks for each

EQUATION FORMATTING:
- For mathematical equations, use LaTeX format with double dollar signs
- Add one extra line space before and after equations
- Example: $$ L = \frac{1}{2} \rho v^2 S C_L $$

CODE FORMATTING:
- Use triple backticks with language specification for code blocks
- Example: \`\`\`javascript\n// your code here\n\`\`\`

Current time: ${formattedTime}
Current date: ${formattedDate}

${savedSystemPrompt || ''}`

    const systemMessage: Message = {
      id: "init",
      content: baseSystemPrompt,
      role: "system",
    }

    const savedMessages = localStorage.getItem(`chat_${activeChatId}`)
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages)
      const updatedMessages = parsedMessages.map((msg: Message) => (msg.id === "init" ? systemMessage : msg))
      setConversationHistory(updatedMessages)
    } else {
      setConversationHistory([systemMessage])
    }
  }, [activeChatId, selectedImageModel])

  useEffect(() => {
    localStorage.setItem(`chat_${activeChatId}`, JSON.stringify(conversationHistory))
  }, [activeChatId, conversationHistory])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversationHistory, messagesEndRef])

  const getAgentDetails = (content: string) => {
    if (content.startsWith("@search ")) {
      return { prefix: "@search", model: "searchgpt", icon: Search }
    } else if (content.startsWith("@code ")) {
      return { prefix: "@code", model: "qwen-coder", icon: Code }
    } else if (content.startsWith("@imagine ")) {
      return { prefix: "@imagine", model: selectedImageModel, icon: ImageIcon }
    }
    return { prefix: null, model: selectedTextModel, icon: null }
  }

  const handleSendMessage = async (content: string) => {
    if (content.trim()) {
      const { prefix, model, icon } = getAgentDetails(content)
      const messageContent = prefix ? content.slice(prefix.length).trim() : content

      const userMessage: Message = {
        id: Date.now().toString(),
        content: messageContent,
        role: "user",
        agent: prefix ? prefix.slice(1) : null,
      }

      const updatedConversationHistory = [...conversationHistory, userMessage]
      setConversationHistory(updatedConversationHistory)
      setInput("")
      setIsLoading(true)

      try {
        const messagesToSend = [
          conversationHistory[0].content,
          ...updatedConversationHistory.slice(1).map((msg) => msg.content),
        ]

        let response
        if (prefix === "@imagine") {
          response = `![Generated Image](https://pollinations.ai/p/${encodeURIComponent(messageContent)}?width=512&height=512&nologo=true&model=${model})`
        } else {
          response = await sendMessage(messagesToSend, model)
        }

        if (response) {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: response,
            role: "ai",
            agent: null,
          }
          const finalConversationHistory = [...updatedConversationHistory, aiMessage]
          setConversationHistory(finalConversationHistory)
          localStorage.setItem(`chat_${activeChatId}`, JSON.stringify(finalConversationHistory))
        } else {
          console.error("Error fetching response from AI model.")
          const errorMessage: Message = {
            id: (Date.now() + 2).toString(),
            content: "Sorry, I encountered an error. Please try again.",
            role: "ai",
          }
          setConversationHistory([...updatedConversationHistory, errorMessage])
        }
      } catch (error) {
        console.error("Error during API call:", error)
        const errorMessage: Message = {
          id: (Date.now() + 3).toString(),
          content: "Sorry, there was a problem connecting to the server.",
          role: "ai",
        }
        setConversationHistory([...updatedConversationHistory, errorMessage])
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handlePromptSelect = (prompt: string) => {
    setInput(prompt)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const clearChat = () => {
    setConversationHistory([conversationHistory[0]])
    localStorage.setItem(`chat_${activeChatId}`, JSON.stringify([conversationHistory[0]]))
  }

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "imageModel") {
        setSelectedImageModel(e.newValue || "flux")
      }
      if (e.key === "textModel") {
        setSelectedTextModel(e.newValue || "openai-fast")
      }
      if (e.key === "theme") {
        setSelectedTheme(e.newValue || "blue")
      }
      if (e.key === "profileName") {
        const { currentGreeting } = getCurrentTimeAndDate()
        setGreeting(`${currentGreeting} ${e.newValue || "User"}`)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  const [isListening, setIsListening] = useState(false)

  const getThemeClasses = () => {
    const themeMap: { [key: string]: string } = {
      blue: "bg-blue-600 hover:bg-blue-700",
      red: "bg-red-600 hover:bg-red-700",
      green: "bg-green-600 hover:bg-green-700",
      purple: "bg-purple-600 hover:bg-purple-700",
      orange: "bg-orange-600 hover:bg-orange-700",
      pink: "bg-pink-600 hover:bg-pink-700",
      teal: "bg-teal-600 hover:bg-teal-700",
      indigo: "bg-indigo-600 hover:bg-indigo-700",
    }
    return themeMap[selectedTheme] || themeMap.blue
  }

  const getFocusRingClass = () => {
    const focusMap: { [key: string]: string } = {
      blue: "focus:ring-blue-500/50",
      red: "focus:ring-red-500/50",
      green: "focus:ring-green-500/50",
      purple: "focus:ring-purple-500/50",
      orange: "focus:ring-orange-500/50",
      pink: "focus:ring-pink-500/50",
      teal: "focus:ring-teal-500/50",
      indigo: "focus:ring-indigo-500/50",
    }
    return focusMap[selectedTheme] || focusMap.blue
  }

  const startListening = () => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = "en-US"

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInput((prevInput) => prevInput + " " + transcript)
      }

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    } else {
      console.error("Speech recognition not supported")
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-black text-white">
      <header className="flex items-center pt-3 pb-0.8 px-3 border-b border-border/20">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="mr-2 text-white hover:bg-white/10"
        >
          <SidebarIcon className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold">ArcGPT</h1>
        <div className="ml-auto flex items-center">
          <Button variant="ghost" size="icon" onClick={clearChat} className="mr-2 text-white hover:bg-white/10">
            <Trash2 className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onFork} className="mr-2 text-white hover:bg-white/10">
            <GitForkIcon className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
            className="text-white hover:bg-white/10"
          >
            <SettingsIcon className="h-6 w-6" />
          </Button>
        </div>
      </header>
      <ScrollArea className="flex-1 p-4 pt-4 pb-0">
        <div className="mb-20 pb-1 max-w-4xl mx-auto pt-4">
          {conversationHistory.length <= 1 && <PromptSuggestions greeting={greeting} onSelect={handlePromptSelect} />}
          {conversationHistory
            .filter((message) => message.role !== "system")
            .map((message) => {
              const { icon: AgentIcon } = getAgentDetails(message.content)
              return (
                <div
                  key={message.id}
                  className={cn("mb-4 flex w-full", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "flex items-start gap-2 w-fit max-w-[85%]",
                      message.role === "user" ? "flex-row-reverse" : "flex-row",
                    )}
                  >
                    <div
                      className={cn(
                        "min-w-[32px] min-h-[32px] w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                        message.role === "user" ? getThemeClasses().split(' ')[0] : "bg-zinc-800",
                      )}
                    >
                      {message.role === "user" ? (
                        AgentIcon ? (
                          <AgentIcon className="h-5 w-5 text-white flex-shrink-0" />
                        ) : (
                          <User className="h-5 w-5 text-white flex-shrink-0" />
                        )
                      ) : (
                        <Bot className="h-5 w-5 text-white flex-shrink-0" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "group relative p-3 rounded-2xl",
                        message.role === "user" ? `${getThemeClasses().split(' ')[0]} text-white` : "bg-zinc-800 text-white",
                      )}
                    >
                      {message.role === "user" ? (
                        <>
                          <span className="break-words">{message.content}</span>
                          {message.agent && (
                            <span className="text-xs text-gray-400 mt-1 block">{message.agent} agent</span>
                          )}
                        </>
                      ) : (
                        <>
                          <MarkdownRenderer>{message.content}</MarkdownRenderer>
                          {message.content.split(" ").length > 100 && (
                            <div className="absolute bottom-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                              <CopyButton value={message.content} />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          {isLoading && (
            <div className="mb-4 flex w-full justify-start">
              <div className="flex items-start gap-2 w-fit">
                <div className="min-w-[32px] min-h-[32px] w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-zinc-800">
                  <Bot className="h-5 w-5 text-white flex-shrink-0" />
                </div>
                <TypingIndicator />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="fixed bottom-0 left-0 right-0 p-4 pt-0 pb-6 max-w-4xl mx-auto w-full z-10">
          <div className="relative flex items-center">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(input)
                }
              }}
              placeholder="Message Arc"
              className={`w-full bg-gray-900/30 backdrop-blur-lg rounded-2xl pl-4 pr-24 py-4 focus:outline-none focus:ring-1 resize-none min-h-[56px] border border-gray-800/40 shadow-lg ${getFocusRingClass()}`}
              style={{ scrollbarWidth: "none" }}
              rows={1}
            />
            <div className="absolute right-2 top-2 flex items-start">
              <Button
                onClick={startListening}
                className="h-10 w-10 flex items-center justify-center rounded-lg bg-zinc-700 p-2 hover:bg-zinc-600 transition-colors mr-2"
                disabled={isListening}
              >
                <Mic className={`h-5 w-5 ${isListening ? "text-red-500" : "text-white"}`} />
                <span className="sr-only">Start voice input</span>
              </Button>
              <Button
                onClick={() => handleSendMessage(input)}
                className={`h-10 w-10 flex items-center justify-center rounded-lg p-2 transition-colors ${getThemeClasses()}`}
                disabled={!input.trim() || isLoading}
              >
                <ArrowUp className="h-5 w-5" />
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
      <Settings
        isOpen={isSettingsOpen}
        setIsOpen={setIsSettingsOpen}
        systemPrompt={systemPrompt}
        setSystemPrompt={setSystemPrompt}
        selectedTextModel={selectedTextModel}
        setSelectedTextModel={setSelectedTextModel}
        selectedImageModel={selectedImageModel}
        setSelectedImageModel={setSelectedImageModel}
        profileName={localStorage.getItem("profileName") || "User"}
        setProfileName={(name: string) => {
          localStorage.setItem("profileName", name)
          const { currentGreeting } = getCurrentTimeAndDate()
          setGreeting(`${currentGreeting} ${name}`)
        }}
        selectedTheme={selectedTheme}
        setSelectedTheme={setSelectedTheme}
      />
    </div>
  )
}
