"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SidebarIcon, ArrowUp, User, Bot, SettingsIcon, Trash2, GitForkIcon, Mic, Search, Code, ImageIcon } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Message } from '@/types/chat'
import { sendMessage } from '@/app/chat'
import { TypingIndicator } from '@/components/interface/typing'
import { CopyButton } from '@/components/interface/copy'
import { PromptSuggestions } from '@/components/interface/prompts'
import { MarkdownRenderer } from '@/components/interface/markdown'
import { getCurrentTimeAndDate } from '@/app/time' 
import { Settings } from './settings'

type ChatProps = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  activeChatId: string
  onFork: () => void
}

export default function Chat({ isOpen, setIsOpen, activeChatId, onFork }: ChatProps) {
  const [conversationHistory, setConversationHistory] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [greeting, setGreeting] = useState("")
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState("")
  const [selectedTextModel, setSelectedTextModel] = useState(() => 
    localStorage.getItem('textModel') || "pi"
  )
  const [selectedImageModel, setSelectedImageModel] = useState(() => 
    localStorage.getItem('imageModel') || "flux"
  )

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  useEffect(() => {
    const { formattedTime, formattedDate, currentGreeting } = getCurrentTimeAndDate();
    const savedProfileName = localStorage.getItem('profileName') || 'User';
    setGreeting(`${currentGreeting} ${savedProfileName}`);

    const savedSystemPrompt = localStorage.getItem('systemPrompt');
    const savedTextModel = localStorage.getItem('textModel');
    const savedImageModel = localStorage.getItem('imageModel');
  
    if (savedSystemPrompt) {
      setSystemPrompt(savedSystemPrompt);
    }
    if (savedTextModel) {
      setSelectedTextModel(savedTextModel);
    }
    if (savedImageModel) {
      setSelectedImageModel(savedImageModel);
    }
  
    const initialSystemPrompt = `You are an AI assistant named Arc. You help user with your queries. Respond to User only in Markdown.
    If asked for equations use like the following equation. $$ L = \frac{1}{2} \rho v^2 S C_L $$ . Make sure to one extra line space before and after the equation.
    If asked to make or generate or show an image, Embed the Prompt of Image in Markdown Like ![](https://pollinations.ai/p/A%20Car%20in%20a%20Lake?width=1280&height=720&nologo=true&model=${selectedImageModel}) 
      Current time: ${formattedTime}
      Current date: ${formattedDate}`;
  
    const systemMessage: Message = {
      id: 'init',
      content: savedSystemPrompt + initialSystemPrompt,
      role: 'system'
    };

    const savedMessages = localStorage.getItem(`chat_${activeChatId}`);
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages);
      const updatedMessages = parsedMessages.map((msg: Message) => 
        msg.id === 'init' ? systemMessage : msg
      );
      setConversationHistory(updatedMessages);
    } else {
      setConversationHistory([systemMessage]);
    }
  }, [activeChatId]);

  useEffect(() => {
    localStorage.setItem(`chat_${activeChatId}`, JSON.stringify(conversationHistory))
  }, [activeChatId, conversationHistory])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversationHistory])

  const getAgentDetails = (content: string) => {
    if (content.startsWith('@search ')) {
      return { prefix: '@search', model: 'searchgpt', icon: Search };
    } else if (content.startsWith('@code ')) {
      return { prefix: '@code', model: 'qwen-coder', icon: Code };
    } else if (content.startsWith('@imagine ')) {
      return { prefix: '@imagine', model: selectedImageModel, icon: ImageIcon };
    }
    return { prefix: null, model: selectedTextModel, icon: null };
  };

  const handleSendMessage = async (content: string) => {
    if (content.trim()) {
      const { prefix, model, icon } = getAgentDetails(content);
      const messageContent = prefix ? content.slice(prefix.length).trim() : content;

      const userMessage: Message = {
        id: Date.now().toString(),
        content: messageContent,
        role: 'user',
        agent: prefix ? prefix.slice(1) : null,
      }

      const updatedConversationHistory = [...conversationHistory, userMessage]
      setConversationHistory(updatedConversationHistory)
      setInput('')
      setIsLoading(true)

      try {
        const messagesToSend = [
          systemPrompt || conversationHistory[0].content, 
          ...updatedConversationHistory.slice(1).map(msg => msg.content)
        ];
        
        let response;if (prefix === '@imagine') {
          response = `![Generated Image](https://pollinations.ai/p/${encodeURIComponent(messageContent)}?width=512&height=512&nologo=true&model=${model})`;
        } else {
          response = await sendMessage(messagesToSend, model)
        }

        if (response) {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: response,
            role: 'ai',
            agent: null,
          }
          const finalConversationHistory = [...updatedConversationHistory, aiMessage]
          setConversationHistory(finalConversationHistory)
          localStorage.setItem(`chat_${activeChatId}`, JSON.stringify(finalConversationHistory))
        } else {
          console.error('Error fetching response from AI model.')
          const errorMessage: Message = {
            id: (Date.now() + 2).toString(),
            content: "Sorry, I encountered an error. Please try again.",
            role: 'ai',
          }
          setConversationHistory([...updatedConversationHistory, errorMessage])
        }
      } catch (error) {
        console.error("Error during API call:", error)
        const errorMessage: Message = {
          id: (Date.now() + 3).toString(),
          content: "Sorry, there was a problem connecting to the server.",
          role: 'ai',
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
      if (e.key === 'imageModel') {
        setSelectedImageModel(e.newValue || 'flux');
      }
      if (e.key === 'profileName') {
        const { currentGreeting } = getCurrentTimeAndDate();
        setGreeting(`${currentGreeting} ${e.newValue || 'User'}`);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prevInput => prevInput + ' ' + transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      console.error('Speech recognition not supported');
    }
  };

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
          <Button
            variant="ghost"
            size="icon"
            onClick={clearChat}
            className="mr-2 text-white hover:bg-white/10"
          >
            <Trash2 className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onFork}
            className="mr-2 text-white hover:bg-white/10"
          >
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
        <div className="max-w-4xl mx-auto">
          {conversationHistory.length <= 1 && (
            <PromptSuggestions 
              greeting={greeting}
              onSelect={handlePromptSelect}
            />
          )}
          {conversationHistory
            .filter(message => message.role !== 'system')
            .map((message) => {
              const { icon: AgentIcon } = getAgentDetails(message.content);
              return (
                <div
                  key={message.id}
                  className={cn(
                    "mb-4 flex w-full",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "flex items-start gap-2 w-fit max-w-[85%]",
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    <div className={cn(
                      "min-w-[32px] min-h-[32px] w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                      message.role === 'user' ? 'bg-blue-600' : 'bg-zinc-800'
                    )}>
                      {message.role === 'user' ? (
                        AgentIcon ? <AgentIcon className="h-5 w-5 text-white flex-shrink-0" /> : <User className="h-5 w-5 text-white flex-shrink-0" />
                      ) : (
                        <Bot className="h-5 w-5 text-white flex-shrink-0" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "group relative p-3 rounded-2xl",
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-zinc-800 text-white'
                      )}
                    >
                      {message.role === 'user' ? (
                        <>
                        <span className="break-words">{message.content}</span>
                        {message.agent && (
                            <span className="text-xs text-gray-400 mt-1 block">
                              {message.agent} agent
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <MarkdownRenderer>{message.content}</MarkdownRenderer>
                          {message.content.split(' ').length > 100 && (
                            <div className="absolute bottom-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                              <CopyButton value={message.content} />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
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
      </ScrollArea>
      <div className="p-4 pt-0 max-w-4xl mx-auto w-full">
        <div className="relative flex items-center">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage(input)
              }
            }}
            placeholder="Message Arc"
            className="w-full bg-zinc-900 text-white rounded-2xl pl-4 pr-24 py-4 focus:outline-none focus:ring-0 resize-none min-h-[56px] max-h-[200px] overflow-y-auto"
            style={{ scrollbarWidth: 'none' }}
            rows={1}
          />
          <div className="absolute right-2 top-2 flex items-start">
            <Button
              onClick={startListening}
              className="h-10 w-10 flex items-center justify-center rounded-lg bg-zinc-700 p-2 hover:bg-zinc-600 transition-colors mr-2"
              disabled={isListening}
            >
              <Mic className={`h-5 w-5 ${isListening ? 'text-red-500' : 'text-white'}`} />
              <span className="sr-only">Start voice input</span>
            </Button>
            <Button
              onClick={() => handleSendMessage(input)}
              className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-600 p-2 hover:bg-blue-700 transition-colors"
              disabled={!input.trim() || isLoading}
            >
              <ArrowUp className="h-5 w-5" />
              <span className="sr-only">Send message</span>
            </Button>
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
        profileName={localStorage.getItem('profileName') || 'User'}
        setProfileName={(name: string) => {
          localStorage.setItem('profileName', name);
          const { currentGreeting } = getCurrentTimeAndDate();
          setGreeting(`${currentGreeting} ${name}`);
        }}
      />
    </div>
  )
}

