"use client"

import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { User, Bot, Search, Code, ImageIcon, BarChart3, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Message, MessageContent } from "@/types/chat"
import { TypingIndicator } from "@/components/interface/typing"
import { CopyButton } from "@/components/interface/copy"
import { MarkdownRenderer } from "@/components/interface/markdown"

type MessageListProps = {
  conversationHistory: Message[]
  failedMessage: any
  isLoading: boolean
  onRetry: (failedMsg: any) => void
  getContentAsString: (content: MessageContent) => string
  getImagesFromContent: (content: MessageContent) => Array<{type: 'image_url', image_url: {url: string}}>
  getAgentDetails: (content: string) => { prefix: string | null, model: string, icon: any }
}

export function MessageList({
  conversationHistory,
  failedMessage,
  isLoading,
  onRetry,
  getContentAsString,
  getImagesFromContent,
  getAgentDetails
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversationHistory])

  return (
    <div className="space-y-6">
        {conversationHistory
          .filter((message) => message.role !== "system" && message.content)
          .map((message, idx) => {
            const contentString = getContentAsString(message.content)
            const { icon: AgentIcon } = getAgentDetails(contentString)
            const messageImages = getImagesFromContent(message.content)
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
                        "min-w-[32px] min-h-[32px] w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 border",
                        message.role === "user" ? "bg-primary/20 backdrop-blur-md text-primary-foreground border-primary/30" : "bg-muted/20 backdrop-blur-md text-foreground border-border/30",
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
                      "group relative rounded-xl overflow-hidden border backdrop-blur-md",
                      message.role === "user" ? "bg-primary/20 text-primary-foreground border-primary/30" : "bg-muted/20 text-foreground border-border/30",
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
                                  className="w-full h-auto rounded-md max-h-60 object-cover border border-primary-foreground/30 backdrop-blur-sm"
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
                              onClick={() => onRetry(failedMessage!)}
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
              <div className="min-w-[32px] min-h-[32px] w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-muted/20 backdrop-blur-md mt-1 border border-border/30">
                <Bot className="h-5 w-5 text-foreground flex-shrink-0" />
              </div>
              <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
    </div>
  )
}
