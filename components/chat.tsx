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
  Paperclip,
  X,
  RotateCcw,
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

export default function Chat({ isOpen, setIsOpen, activeChatId, onFork, chatTabs, setChatTabs }: ChatProps) {
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

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

    const baseSystemPrompt = `You are an AI assistant named Arc. You help user with your queries. Respond to User only in Markdown.
    If asked for equations use like the following equation. $$ L = \frac{1}{2} \rho v^2 S C_L $$ . Make sure to one extra line space before and after the equation.
    If asked to make or generate or show an image, Embed the Prompt of Image in Markdown Like ![](https://pollinations.ai/p/A%20Car%20in%20a%20Lake?width=1280&height=720&nologo=true&model=${selectedImageModel}) 
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

  const handleSendMessage = async (content: string, retryImages?: Array<{id: string, url: string, name: string}>) => {
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
      id: Date.now().toString(),
      content: userMessageContent,
      role: "user",
      agent: prefix ? prefix.slice(1) : null,
    }
    setInput("")
    setSelectedImages([])
    setIsLoading(true)
    setFailedMessage(null)
    const updatedConversationHistory = [...conversationHistory, userMessage]
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
        setConversationHistory(prev => [...prev, aiMessage])
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

  const [isListening, setIsListening] = useState(false)

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

  const handleRetry = (failedMsg: FailedMessage) => {
    if (!failedMsg.retryData) return
    
    // Remove the failed message and any error messages that followed it
    setConversationHistory(prev => {
      const failedIndex = prev.findIndex(msg => msg.id === failedMsg.id)
      if (failedIndex !== -1) {
        // Remove the failed message and any subsequent AI error messages
        return prev.slice(0, failedIndex)
      }
      return prev
    })
    
    // Clear the failed message state
    setFailedMessage(null)
    
    // Retry sending the message
    handleSendMessage(failedMsg.retryData.text, failedMsg.retryData.images)
  }

  // Don't render until initialized to prevent hydration mismatch
  if (!isInitialized) {
    return <div className="flex-1 flex flex-col bg-black text-white" />
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
      <ScrollArea className="flex-1 p-4 pt-0 pb-0">
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10" />
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
                        message.role === "user" ? "bg-blue-600" : "bg-zinc-800",
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
                        "group relative rounded-2xl overflow-hidden",
                        message.role === "user" ? "bg-blue-600 text-white" : "bg-zinc-800 text-white",
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
                                    className="w-full h-auto rounded-md max-h-60 object-cover border border-white/20"
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
                            <div className="text-xs text-blue-200 mt-2 opacity-80">
                              {message.agent} agent
                            </div>
                          )}
                          {isFailed && (
                            <div className="mt-2 flex items-center justify-end">
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-md flex items-center gap-1.5"
                                onClick={() => handleRetry(failedMessage!)}
                                disabled={isLoading}
                                title="Retry sending message"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span className="text-xs">Retry</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-4">
                          <MarkdownRenderer>{contentString}</MarkdownRenderer>
                          {contentString.split(" ").length > 100 && (
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
                <div className="min-w-[32px] min-h-[32px] w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-zinc-800 mt-1">
                  <Bot className="h-5 w-5 text-white flex-shrink-0" />
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
            <div className="mb-3 p-4 bg-background p-4 hover:bg-muted border-gray-700/50 rounded-xl border border-gray-700/50 shadow-lg">
              <div className="flex flex-wrap gap-3">
                {selectedImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-24 h-24 object-cover rounded-lg border border-gray-600 shadow-md"
                    />
                    <button
                      onClick={() => removeImage(image.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white text-xs p-2 rounded-b-lg">
                      <div className="truncate font-medium">{image.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Image Error Message */}
          {imageError && (
            <div className="mb-2 p-2 bg-red-700/50 text-white rounded-lg border border-red-400/50 text-sm font-medium">
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
              placeholder="Message Arc"
              className="w-full bg-background p-4 border-gray-700/50 rounded-2xl pl-4 pr-36 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none min-h-[56px] max-h-32 border border-gray-700/50 shadow-lg text-white placeholder-gray-400"
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
                className="h-10 w-10 flex items-center justify-center rounded-lg bg-zinc-700 p-2 hover:bg-zinc-600 transition-colors disabled:opacity-50"
                title="Attach images"
                disabled={isLoading}
              >
                <Paperclip className="h-5 w-5 text-white" />
                <span className="sr-only">Attach image</span>
              </Button>
              <Button
                onClick={startListening}
                className="h-10 w-10 flex items-center justify-center rounded-lg bg-zinc-700 p-2 hover:bg-zinc-600 transition-colors disabled:opacity-50"
                disabled={isListening || isLoading}
                title="Voice input"
              >
                <Mic className={`h-5 w-5 ${isListening ? "text-red-500" : "text-white"}`} />
                <span className="sr-only">Start voice input</span>
              </Button>
              <Button
                onClick={() => handleSendMessage(input)}
                className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-600 p-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  )
}
