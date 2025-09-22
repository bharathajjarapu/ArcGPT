"use client"

import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { Message, ChatTab, MessageContent } from "@/types/chat"
import { sendMessage } from "@/app/chat"
import { PromptSuggestions } from "@/components/interface/prompts"
import { getCurrentTimeAndDate } from "@/app/time"
import { Settings } from "./settings"
import { ChatHeader } from "./chat/header"
import { MessageList } from "./chat/messages"
import { InputArea } from "./chat/inputbar"
import { debouncedSetItem, batchSetItem } from "@/lib/storage"
import { Search, Code, ImageIcon, BarChart3 } from "lucide-react"

type ChatProps = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  activeChatId: string
  onFork: () => void
  chatTabs: ChatTab[]
  setChatTabs: (chatTabs: ChatTab[]) => void
  onNewChat: () => void
}

// Add a type for failed messages
interface FailedMessage {
  id: string;
  content: MessageContent;
  role: 'user';
  agent?: string | null;
  retryData?: {
    text: string;
    images: Array<{id: string, url: string, name: string}>;
  };
}

export default function Chat({ isOpen, setIsOpen, activeChatId, onFork, chatTabs, setChatTabs, onNewChat }: ChatProps) {
  const [conversationHistory, setConversationHistory] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [greeting, setGreeting] = useState("")
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState("")
  const [selectedTextModel, setSelectedTextModel] = useState("openai")
  const [selectedImageModel, setSelectedImageModel] = useState("flux")
  const [selectedImages, setSelectedImages] = useState<Array<{id: string, url: string, name: string}>>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [failedMessage, setFailedMessage] = useState<FailedMessage | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false)

  // Initialize from localStorage after component mounts to prevent hydration issues
  useEffect(() => {
    const initializeFromStorage = () => {
      const savedTextModel = localStorage.getItem("textModel")
      const savedImageModel = localStorage.getItem("imageModel")
      
      if (savedTextModel) setSelectedTextModel(savedTextModel)
      if (savedImageModel) setSelectedImageModel(savedImageModel)
      
      setIsInitialized(true)
    }
    
    initializeFromStorage()
  }, [])

  // Memoize helper functions for better performance
  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }, [])

  const getContentAsString = useCallback((content: MessageContent): string => {
    if (typeof content === 'string') {
      return content
    }
    // For array content, get only text parts
    const textParts = content.filter(item => item.type === 'text').map(item => item.text)
    return textParts.join(' ')
  }, [])

  const getImagesFromContent = useCallback((content: MessageContent): Array<{type: 'image_url', image_url: {url: string}}> => {
    if (Array.isArray(content)) {
      return content.filter(item => item.type === 'image_url') as Array<{type: 'image_url', image_url: {url: string}}>
    }
    return []
  }, [])

  const getAgentDetails = useCallback((content: string) => {
    if (content.startsWith("@search ")) {
      return { prefix: "@search", model: "searchgpt", icon: Search }
    } else if (content.startsWith("@code ")) {
      return { prefix: "@code", model: "qwen-coder", icon: Code }
    } else if (content.startsWith("@imagine ")) {
      return { prefix: "@imagine", model: selectedImageModel, icon: ImageIcon }
    } else if (content.startsWith("@chart ")) {
      return { prefix: "@chart", model: selectedTextModel, icon: BarChart3 }
    }
    return { prefix: null, model: selectedTextModel, icon: null }
  }, [selectedTextModel, selectedImageModel])

  // Memoize the system prompt to avoid recalculation
  const systemPromptMemo = useMemo(() => {
    if (!isInitialized) return ""

    const { formattedTime, formattedDate, currentGreeting } = getCurrentTimeAndDate()
    const savedProfileName = localStorage.getItem("profileName") || "User"
    setGreeting(`${currentGreeting} ${savedProfileName}`)

    const savedSystemPrompt = localStorage.getItem("systemPrompt")
    if (savedSystemPrompt) {
      setSystemPrompt(savedSystemPrompt)
    }

    const baseSystemPrompt = `You are an AI assistant named Arc. You help the user with their queries. Respond to the user only in Markdown.

    For math equations:
    - Use single dollar signs ($...$) for inline math.
    - Use double dollar signs ($$...$$) for display math, and ensure there is a blank line before and after the equation block for proper rendering.

    For images:
    - If asked to make, generate, or show an image, embed the prompt in Markdown using:
      ![](https://pollinations.ai/p/<PROMPT>?width=1280&height=720&nologo=true&model=${selectedImageModel})
    - Replace <PROMPT> with the image description, URL-encoded.

    For charts and data visualizations:
    - ALWAYS create interactive charts using the special 'chart' code block format when users ask for charts or provide data
    - NEVER just describe charts - ALWAYS generate the actual chart code block
    - Supported chart types: 'bar', 'line', 'pie', 'area', 'scatter'
    - MANDATORY format (copy this exactly):
      \`\`\`chart
      {
        "type": "bar",
        "title": "Your Chart Title",
        "data": [
          {"name": "Category1", "value": 100},
          {"name": "Category2", "value": 200}
        ]
      }
      \`\`\`
    - CRITICAL: The code block MUST start with \`\`\`chart (not \`\`\`json or \`\`\`javascript)
    - For multiple data series, use an array for yAxis: "yAxis": ["series1", "series2"]
    - You can specify custom colors: "colors": ["#8884d8", "#82ca9d", "#ffc658"]
    - When user asks for ANY chart or provides data, IMMEDIATELY generate the chart code block
    - When user uses @chart prefix, focus EXCLUSIVELY on generating charts with minimal explanation
    - For @chart requests, provide the chart code block first, then a brief one-line explanation

    Current time: ${formattedTime}
    Current date: ${formattedDate}
    
    ${savedSystemPrompt || ''}`

    return baseSystemPrompt
  }, [isInitialized, selectedImageModel])

  useEffect(() => {
    if (!isInitialized || !systemPromptMemo) return

    const systemMessage: Message = {
      id: "init",
      content: systemPromptMemo,
      role: "system",
    }

    const savedMessages = localStorage.getItem(`chat_${activeChatId}`)
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages)
        const updatedMessages = parsedMessages.map((msg: Message) => (msg.id === "init" ? systemMessage : msg))
        setConversationHistory(updatedMessages)
      } catch (error) {
        console.error("Error parsing saved messages:", error)
        setConversationHistory([systemMessage])
      }
    } else {
      setConversationHistory([systemMessage])
    }
  }, [activeChatId, systemPromptMemo, isInitialized])

  // Use debounced localStorage for conversation history
  useEffect(() => {
    if (conversationHistory.length > 0 && isInitialized) {
      debouncedSetItem(`chat_${activeChatId}`, JSON.stringify(conversationHistory))
    }
  }, [activeChatId, conversationHistory, isInitialized])

  // Auto-scrolling is now handled in MessageList component

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    
    try {
      const imagePromises = Array.from(files).map(async (file) => {
        // Check file size first (500KB limit to prevent server body size issues)
        if (file.size > 512 * 1024) {
          console.warn('Image size must be less than 500KB. Please choose a smaller image.')
          return null
        }
        
        // Check if it's an image file
        if (!file.type.startsWith('image/')) {
          console.warn('Please select only image files.')
          return null
        }
        
        try {
          const base64 = await fileToBase64(file)
          const imageId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
          return { id: imageId, url: base64, name: file.name }
        } catch (error) {
          console.error('Failed to process image. Please try again.')
          return null
        }
      })
      
      const images = await Promise.all(imagePromises)
      const validImages = images.filter(img => img !== null) as Array<{id: string, url: string, name: string}>
      
      if (validImages.length > 0) {
        setSelectedImages(prev => [...prev, ...validImages])
      }
    } catch (error) {
      console.error("Error uploading images:", error)
    }
  }, [fileToBase64])

  const removeImage = useCallback((imageId: string) => {
    setSelectedImages(prev => prev.filter(img => img.id !== imageId))
  }, [])

  // Memoize handleSendMessage for better performance
  const handleSendMessage = useCallback(async (content: string, retryImages?: Array<{id: string, url: string, name: string}>, retryMessageId?: string) => {
    if (isLoading || (!content.trim() && (selectedImages.length === 0 && (!retryImages || retryImages.length === 0)))) {
      return
    }
    const imagesToSend = retryImages || selectedImages
    const { prefix, model } = getAgentDetails(content)
    const messageContent = prefix ? content.slice(prefix.length).trim() : content
    let userMessageContent: MessageContent
    if (prefix === "@imagine") {
      userMessageContent = messageContent
    } else if (imagesToSend.length > 0) {
      const contentArray: Array<{type: 'text', text: string} | {type: 'image_url', image_url: {url: string}}> = []
      if (messageContent.trim()) {
        contentArray.push({ type: 'text', text: messageContent })
      }
      imagesToSend.forEach(img => {
        contentArray.push({
          type: 'image_url',
          image_url: { url: img.url }
        })
      })
      userMessageContent = contentArray
    } else {
      userMessageContent = messageContent
    }
    const userMessage: Message = {
      id: retryMessageId || Date.now().toString(),
      content: userMessageContent,
      role: "user",
      agent: prefix ? prefix.slice(1) : null,
    }
    setInput("")
    setSelectedImages([])
    setIsLoading(true)
    setFailedMessage(null)
    let updatedConversationHistory: Message[]
    if (retryMessageId) {
      // Replace the failed message and any following AI error message
      updatedConversationHistory = conversationHistory.filter((msg, idx, arr) => {
        if (msg.id === retryMessageId) {
          // Remove this user message and the next AI error message (if any)
          if (arr[idx + 1] && arr[idx + 1].role === "ai" && arr[idx + 1].content.toString().includes("Sorry")) {
            arr.splice(idx + 1, 1)
          }
          return false
        }
        return true
      })
      updatedConversationHistory = [...updatedConversationHistory, userMessage]
    } else {
      updatedConversationHistory = [...conversationHistory, userMessage]
    }
    setConversationHistory(updatedConversationHistory)
    try {
      let response
      if (prefix === "@imagine") {
        response = `![Generated Image](https://pollinations.ai/p/${encodeURIComponent(messageContent)}?width=512&height=512&nologo=true&model=${model})`
      } else {
        response = await sendMessage(updatedConversationHistory, model)
      }
      if (response) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response,
          role: "ai",
          agent: null,
        }
        setConversationHistory(prev => {
          const hadAiBefore = prev.some(m => m.role === 'ai')
          const next = [...prev, aiMessage]
          // Trigger auto-rename only on the first AI reply
          if (!hadAiBefore) {
            const firstUserText = getContentAsString(userMessageContent)
            // Fire and forget
            maybeAutoRenameChat(firstUserText)
          }
          return next
        })
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 2).toString(),
          content: "Sorry, I encountered an error. Please try again.",
          role: "ai",
        }
        setConversationHistory(prev => [...prev, errorMessage])
        setFailedMessage({
          id: userMessage.id,
          content: userMessageContent,
          role: 'user',
          agent: userMessage.agent,
          retryData: { text: content, images: imagesToSend }
        })
      }
    } catch (error: any) {
      let isTimeout = false
      if (error && error.message && error.message.includes('524')) {
        isTimeout = true
      }
      const errorMessage: Message = {
        id: (Date.now() + 3).toString(),
        content: isTimeout ? "The AI service timed out (524). Please try again or click Retry." : "Sorry, there was a problem connecting to the server.",
        role: "ai",
      }
      setConversationHistory(prev => [...prev, errorMessage])
      setFailedMessage({
        id: userMessage.id,
        content: userMessageContent,
        role: 'user',
        agent: userMessage.agent,
        retryData: { text: content, images: imagesToSend }
      })
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, selectedImages, getAgentDetails, conversationHistory, getContentAsString])

  const handlePromptSelect = useCallback((prompt: string) => {
    setInput(prompt)
  }, [])

  const clearChat = useCallback(() => {
    if (conversationHistory.length > 0) {
      const systemMessage = conversationHistory[0]
      setConversationHistory([systemMessage])
      setSelectedImages([])
      setInput("")
      debouncedSetItem(`chat_${activeChatId}`, JSON.stringify([systemMessage]))
    }
  }, [conversationHistory, activeChatId])

  // Attempt to auto-rename the active chat after the first AI reply
  const maybeAutoRenameChat = useCallback(async (firstUserMessageText: string) => {
    try {
      const active = chatTabs.find((t) => t.id === activeChatId)
      if (!active || active.name !== "Chat") return

      // Fallback title from first user message
      const fallback = firstUserMessageText.trim().slice(0, 40) || "New Chat"

      // Ask the model for a short title
      const titlePrompt: Message[] = [
        { id: "sys-title", role: "system", content: "You generate a single-word chat title. Rules: reply with exactly one word, no spaces, no punctuation or quotes. Prefer TitleCase. If multiple words are needed, merge them into one (e.g., MachineLearning). Reply with the title only." },
        { id: "user-title", role: "user", content: `First message: ${firstUserMessageText}` },
      ]
      const aiTitle = await sendMessage(titlePrompt, selectedTextModel)
      const cleaned = (aiTitle || "").replace(/["'`]/g, "").replace(/[\n\r]/g, " ").trim()
      // Enforce single word: remove all non-alphanumeric characters
      const singleWord = cleaned.replace(/[^A-Za-z0-9]+/g, "")
      // Build a sane fallback as single word from the first user message
      const tokens = (firstUserMessageText || "").match(/[A-Za-z0-9]+/g) || []
      const fallbackSingle = tokens.length
        ? tokens.slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("")
        : "NewChat"
      const finalTitle = (singleWord || fallbackSingle).slice(0, 30)

      // Only rename if still default name to avoid overriding user edits
      const stillDefault = chatTabs.find((t) => t.id === activeChatId)?.name === "Chat"
      if (!stillDefault) return
      const updatedTabs: ChatTab[] = chatTabs.map((t) => (t.id === activeChatId ? { ...t, name: finalTitle } : t))
      setChatTabs(updatedTabs)
    } catch {
      // Silently ignore title generation errors
    }
  }, [chatTabs, activeChatId, selectedTextModel, setChatTabs])

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "imageModel") {
        setSelectedImageModel(e.newValue || "flux")
      }
      if (e.key === "textModel") {
        setSelectedTextModel(e.newValue || "openai")
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

  const startListening = useCallback(() => {
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
  }, [])

  // Update handleRetry to use the same message id and not duplicate user messages
  const handleRetry = useCallback((failedMsg: FailedMessage) => {
    if (!failedMsg.retryData) return
    setFailedMessage(null)
    handleSendMessage(failedMsg.retryData.text, failedMsg.retryData.images, failedMsg.id)
  }, [handleSendMessage])

  // Don't render until initialized to prevent hydration mismatch
  if (!isInitialized) {
    return <div className="flex-1 flex flex-col bg-background text-foreground" />
  }

  const hasMessages = conversationHistory.some((m) => m.role !== "system")

  // Check if there are any actual user messages (excluding system messages)
  const hasUserMessages = conversationHistory.some((m) => m.role === "user")

  return (
    <div className="flex-1 flex flex-col bg-background text-foreground h-full">
      {/* Fixed Header */}
      <div className="flex-shrink-0">
        <ChatHeader
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          onNewChat={onNewChat}
          onClearChat={() => setIsClearConfirmOpen(true)}
          onFork={onFork}
          onSettingsOpen={() => setIsSettingsOpen(true)}
          hasMessages={hasMessages}
          activeChatName={chatTabs.find(chat => chat.id === activeChatId)?.name || 'ArcGPT'}
        />
      </div>

      {/* Main Content Area with Floating Input */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {/* Chat Content */}
        <div className="flex-1 min-h-0">
          {!hasUserMessages ? (
            /* Homepage/Empty state - no scroll area, centered content */
            <div className="h-full flex items-center justify-center p-4">
              <div className="max-w-4xl mx-auto w-full text-center">
                <PromptSuggestions greeting={greeting} onSelect={handlePromptSelect} />
              </div>
                </div>
          ) : (
            /* Chat view with scrollable area */
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 pb-24">
                  <div className="max-w-4xl mx-auto">
                    <MessageList
                      conversationHistory={conversationHistory}
                      failedMessage={failedMessage}
                      isLoading={isLoading}
                      onRetry={handleRetry}
                      getContentAsString={getContentAsString}
                      getImagesFromContent={getImagesFromContent}
                      getAgentDetails={getAgentDetails}
                    />
              </div>
            </div>
          </div>
        </div>
      )}
        </div>

        {/* Floating Input Area - Overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
                        <div className="p-4">
            <div className="max-w-4xl mx-auto">
              <InputArea
                input={input}
                setInput={setInput}
                selectedImages={selectedImages}
                setSelectedImages={setSelectedImages}
                isLoading={isLoading}
                isDragOver={isDragOver}
                setIsDragOver={setIsDragOver}
                onSendMessage={handleSendMessage}
                onImageUpload={handleImageUpload}
                onStartListening={startListening}
                isListening={isListening}
                fileToBase64={fileToBase64}
                                  />
                                </div>
                    </div>
                  </div>
                </div>

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
        chatTabs={chatTabs}
        setChatTabs={setChatTabs}
      />

      {/* Clear Chat Confirm Dialog */}
      <Dialog open={isClearConfirmOpen} onOpenChange={setIsClearConfirmOpen}>
        <DialogContent className="sm:max-w-[460px] bg-zinc-950 border border-zinc-800">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div>
                <DialogTitle className="leading-tight">Clear this chat?</DialogTitle>
                <DialogDescription className="mt-3">
                  This will permanently remove all messages in the current chat. You cannot undo this action.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-1 rounded-lg border border-border/50 bg-muted/40 p-3 text-sm text-muted-foreground">
            Tip: You can export your chats from Settings → Profile → Backup & Restore.
          </div>

          <DialogFooter className="mt-1">
            <Button variant="outline" onClick={() => setIsClearConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearChat()
                setIsClearConfirmOpen(false)
              }}
            >
              Clear Chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
