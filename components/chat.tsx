"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
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
  Paperclip,
  X,
  RotateCcw,
  Upload,
  FileImage,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Message, ChatTab, MessageContent } from "@/types/chat"
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
  const [imageError, setImageError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragOverlayRef = useRef<HTMLDivElement>(null)

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

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  // Helper function to get content as string for display
  const getContentAsString = (content: MessageContent): string => {
    if (typeof content === 'string') {
      return content
    }
    // For array content, get only text parts
    const textParts = content.filter(item => item.type === 'text').map(item => item.text)
    return textParts.join(' ')
  }

  // Helper function to get images from content
  const getImagesFromContent = (content: MessageContent): Array<{type: 'image_url', image_url: {url: string}}> => {
    if (Array.isArray(content)) {
      return content.filter(item => item.type === 'image_url') as Array<{type: 'image_url', image_url: {url: string}}>
    }
    return []
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set drag over to false if we're leaving the entire drop zone
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))

    if (imageFiles.length === 0) {
      setImageError('Please drop only image files')
      return
    }

    setImageError(null)
    
    for (const file of imageFiles) {
      try {
        const base64 = await fileToBase64(file)
        const imageId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
        setSelectedImages(prev => [...prev, {
          id: imageId,
          url: base64,
          name: file.name
        }])
      } catch (error) {
        setImageError(`Failed to process ${file.name}`)
      }
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  useEffect(() => {
    if (!isInitialized) return

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

    const systemMessage: Message = {
      id: "init",
      content: baseSystemPrompt,
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
  }, [activeChatId, selectedImageModel, isInitialized])

  useEffect(() => {
    if (conversationHistory.length > 0 && isInitialized) {
      localStorage.setItem(`chat_${activeChatId}`, JSON.stringify(conversationHistory))
    }
  }, [activeChatId, conversationHistory, isInitialized])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversationHistory])

  const getAgentDetails = (content: string) => {
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
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    
    setImageError(null)
    
    try {
      const imagePromises = Array.from(files).map(async (file) => {
        // Check file size first (500KB limit to prevent server body size issues)
        if (file.size > 512 * 1024) {
          setImageError('Image size must be less than 500KB. Please choose a smaller image.')
          return null
        }
        
        // Check if it's an image file
        if (!file.type.startsWith('image/')) {
          setImageError('Please select only image files.')
          return null
        }
        
        try {
          const base64 = await fileToBase64(file)
          const imageId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
          return { id: imageId, url: base64, name: file.name }
        } catch (error) {
          setImageError('Failed to process image. Please try again.')
          return null
        }
      })
      
      const images = await Promise.all(imagePromises)
      const validImages = images.filter(img => img !== null) as Array<{id: string, url: string, name: string}>
      
      if (validImages.length > 0) {
        setSelectedImages(prev => [...prev, ...validImages])
      }
    } catch (error) {
      setImageError('Failed to upload image. Please try again.')
      console.error("Error uploading images:", error)
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeImage = (imageId: string) => {
    setSelectedImages(prev => prev.filter(img => img.id !== imageId))
  }

  // Update handleSendMessage to accept an optional messageId for retries
  const handleSendMessage = async (content: string, retryImages?: Array<{id: string, url: string, name: string}>, retryMessageId?: string) => {
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
  }

  const handlePromptSelect = (prompt: string) => {
    setInput(prompt)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const clearChat = () => {
    if (conversationHistory.length > 0) {
      const systemMessage = conversationHistory[0]
      setConversationHistory([systemMessage])
      setSelectedImages([])
      setInput("")
      localStorage.setItem(`chat_${activeChatId}`, JSON.stringify([systemMessage]))
    }
  }

  // Attempt to auto-rename the active chat after the first AI reply
  const maybeAutoRenameChat = async (firstUserMessageText: string) => {
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
  }

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

  // Update handleRetry to use the same message id and not duplicate user messages
  const handleRetry = (failedMsg: FailedMessage) => {
    if (!failedMsg.retryData) return
    setFailedMessage(null)
    handleSendMessage(failedMsg.retryData.text, failedMsg.retryData.images, failedMsg.id)
  }

  // Don't render until initialized to prevent hydration mismatch
  if (!isInitialized) {
    return <div className="flex-1 flex flex-col bg-background text-foreground" />
  }

  return (
    <div 
      className="flex-1 flex flex-col bg-background text-foreground relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      {isDragOver && (
        <div
          ref={dragOverlayRef}
          className="absolute inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm"
        >
          <div className="mx-4 max-w-md w-full">
            <div className="text-center px-6 py-8 rounded-xl bg-card/90 border-2 border-dashed border-primary/30 shadow-lg">
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center">
                  <Upload className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-medium">Drop images to upload</h3>
                <p className="text-xs text-muted-foreground">JPG, PNG, GIF, WebP • Max 500KB each</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
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
            const hasNonSystemMessages = conversationHistory.some((m) => m.role !== "system")
            if (hasNonSystemMessages) {
              onNewChat()
            }
          }}
          className="text-xl font-semibold select-none hover:opacity-90 active:opacity-80 transition-opacity"
          title="New Chat"
        >
          ArcGPT
        </button>
        <div className="ml-auto flex items-center">
          <Button variant="ghost" size="icon" onClick={() => setIsClearConfirmOpen(true)} className="mr-2">
            <Trash2 className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onFork} className="mr-2">
            <GitForkIcon className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
            className=""
          >
            <SettingsIcon className="h-6 w-6" />
          </Button>
        </div>
      </header>
      <ScrollArea className="flex-1 p-4 pt-0 pb-0 transition-all duration-200">
        <div className="mb-32 pb-1 max-w-4xl mx-auto pt-4">
          {conversationHistory.length <= 1 && <PromptSuggestions greeting={greeting} onSelect={handlePromptSelect} />}
          {conversationHistory
            .filter((message) => message.role !== "system")
            .map((message, idx) => {
              const contentString = getContentAsString(message.content)
              const { icon: AgentIcon } = getAgentDetails(contentString)
              const messageImages = getImagesFromContent(message.content)
              // Check if this is the failed message
              const isFailed = failedMessage && failedMessage.id === message.id
              return (
                <div
                  key={message.id}
                  className={cn("mb-6 flex w-full", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "flex items-start gap-3 w-fit max-w-[85%]",
                      message.role === "user" ? "flex-row-reverse" : "flex-row",
                    )}
                  >
                    <div
                      className={cn(
                        "min-w-[32px] min-h-[32px] w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                      )}
                    >
                      {message.role === "user" ? (
                        AgentIcon ? (
                          <AgentIcon className="h-5 w-5 text-primary-foreground flex-shrink-0" />
                        ) : (
                          <User className="h-5 w-5 text-primary-foreground flex-shrink-0" />
                        )
                      ) : (
                        <Bot className="h-5 w-5 text-foreground flex-shrink-0" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "group relative rounded-xl overflow-hidden border",
                        message.role === "user" ? "bg-primary text-primary-foreground border-primary/20" : "bg-muted text-foreground border-border/50",
                      )}
                    >
                      {message.role === "user" ? (
                        <div className="p-4">
                          {messageImages.length > 0 && (
                            <div className={cn(
                              "mb-3 grid gap-2 rounded-lg overflow-hidden",
                              messageImages.length === 1 ? "grid-cols-1 max-w-xs" :
                              messageImages.length === 2 ? "grid-cols-2 max-w-md" :
                              "grid-cols-2 max-w-lg"
                            )}>
                              {messageImages.map((img, idx) => (
                                <div key={idx} className="relative">
                                  <img
                                    src={img.image_url.url}
                                    alt={`Uploaded image ${idx + 1}`}
                                    className="w-full h-auto rounded-md max-h-60 object-cover border border-primary-foreground/20"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                          {contentString && (
                            <div className="break-words whitespace-pre-wrap text-sm leading-relaxed">
                              {contentString}
                            </div>
                          )}
                          {message.agent && (
                            <div className="text-xs text-primary-foreground/80 mt-2 opacity-80">
                              {message.agent} agent
                            </div>
                          )}
                          {isFailed && (
                            <div className="mt-2 flex items-center justify-end">
                              <Button
                                size="icon"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground p-1 rounded-md flex items-center"
                                onClick={() => handleRetry(failedMessage!)}
                                disabled={isLoading}
                                title="Retry sending message"
                                style={{ width: 28, height: 28, minWidth: 28, minHeight: 28 }}
                              >
                                <RotateCcw className="w-4 h-4" />
                                <span className="sr-only">Retry</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-4">
                          <MarkdownRenderer>{contentString}</MarkdownRenderer>
                          {contentString.split(" ").length > 100 && !/```[\s\S]*?```/.test(contentString) && (
                            <div className="absolute bottom-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                              <CopyButton value={contentString} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          {isLoading && (
            <div className="mb-4 flex w-full justify-start">
              <div className="flex items-start gap-3 w-fit">
                <div className="min-w-[32px] min-h-[32px] w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-muted mt-1">
                  <Bot className="h-5 w-5 text-foreground flex-shrink-0" />
                </div>
                <TypingIndicator />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="fixed bottom-0 left-0 right-0 p-4 pt-0 max-w-4xl mx-auto w-full z-10">
          {/* Image Preview */}
          {selectedImages.length > 0 && (
            <div className="mb-3 p-3 bg-card hover:bg-muted/60 border border-border/50 rounded-xl shadow-sm">
              <div className="flex flex-wrap gap-3">
                {selectedImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-24 h-24 object-cover rounded-lg border border-border/50 shadow-sm"
                    />
                    <button
                      onClick={() => removeImage(image.id)}
                      title="Remove image"
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-destructive/90 transition-colors opacity-0 group-hover:opacity-100 shadow-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/80 to-transparent text-foreground text-[10px] px-2 py-1 rounded-b-lg">
                      <div className="truncate">{image.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Image Error Message */}
          {imageError && (
            <div className="mb-2 p-2 bg-destructive/10 text-destructive-foreground rounded-lg border border-destructive/30 text-sm font-medium">
              {imageError}
            </div>
          )}
          <div className="relative flex items-end">
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
              placeholder={isDragOver ? "Drop images here..." : "Message Arc"}
              className={cn(
                "w-full bg-background p-4 border-border/50 rounded-2xl pl-4 pr-36 py-4 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none min-h-[56px] max-h-32 border shadow-lg text-foreground placeholder:text-muted-foreground transition-all duration-200",
                isDragOver 
                  ? "border-primary/40 ring-2 ring-primary/20 bg-primary/5" 
                  : "border-border/50"
              )}
              style={{ scrollbarWidth: "none" }}
              rows={1}
              disabled={isLoading}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={isLoading}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="h-10 w-10 flex items-center justify-center rounded-lg p-2 transition-all duration-200 disabled:opacity-50 bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                title="Attach images"
                disabled={isLoading}
              >
                <Paperclip className="h-5 w-5" />
                <span className="sr-only">Attach image</span>
              </Button>
              <Button
                onClick={startListening}
                className="h-10 w-10 flex items-center justify-center rounded-lg bg-secondary p-2 hover:bg-secondary/80 transition-colors disabled:opacity-50 text-secondary-foreground"
                disabled={isListening || isLoading}
                title="Voice input"
              >
                <Mic className={`h-5 w-5 ${isListening ? "text-red-500" : ""}`} />
                <span className="sr-only">Start voice input</span>
              </Button>
              <Button
                onClick={() => handleSendMessage(input)}
                className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary p-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground"
                disabled={(!input.trim() && selectedImages.length === 0) || isLoading}
                title="Send message"
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
