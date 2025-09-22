import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatTab } from '@/types/chat'
import { MessageSquare, PlusCircle, Pencil, Trash } from 'lucide-react'
import { useState } from 'react'
import { cn } from "@/lib/utils"

type SidebarProps = {
  isOpen: boolean
  chatTabs: ChatTab[]
  activeChatId: string
  setActiveChatId: (id: string) => void
  addNewChat: () => void
  editChatName: (id: string, newName: string) => void
  deleteChat: (id: string) => void
}

export default function Sidebar({
  isOpen,
  chatTabs,
  activeChatId,
  setActiveChatId,
  addNewChat,
  editChatName,
  deleteChat
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleEditSubmit = (id: string, value: string) => {
    editChatName(id, value)
    setEditingId(null)
  }

  return (
    <div
      className={cn(
        "h-full bg-zinc-950/20 backdrop-blur-md border-r border-border/30 overflow-hidden transition-[width] duration-400 ease-out flex flex-col",
        isOpen ? "w-[200px]" : "w-0"
      )}
      style={{ minWidth: isOpen ? '200px' : '0px' }}
    >
      <div className="w-[200px] h-full flex flex-col">
        <div className="px-3 py-3">
          <Button
            onClick={addNewChat}
            variant="outline"
            size="lg"
            className="w-full justify-start gap-2 text-white bg-background/20 backdrop-blur-sm border-border/30"
          >
            <PlusCircle className="h-4 w-4" />
            New Chat
          </Button>
        </div>
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-2">
            {chatTabs.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "group flex items-center justify-between rounded-lg px-2 py-2 text-sm transition-all duration-300 hover:bg-accent/20 cursor-pointer w-full h-10 border backdrop-blur-sm transform",
                chat.id === activeChatId
                  ? "bg-accent/30 border-accent/50 text-accent-foreground shadow-lg shadow-accent/20 ring-1 ring-accent/30 scale-[1.02]"
                  : "border-border/30 bg-background/20 hover:border-accent/40 text-white hover:scale-[1.01]"
              )}
              onClick={() => setActiveChatId(chat.id)}
            >
              {editingId === chat.id ? (
                <Input
                  autoFocus
                  defaultValue={chat.name}
                  className="h-7 bg-background/20 backdrop-blur-sm text-white w-full border-border/30"
                  onBlur={(e) => handleEditSubmit(chat.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleEditSubmit(chat.id, e.currentTarget.value)
                    }
                  }}
                />
              ) : (
                <>
                  <div className="flex items-center gap-2 flex-1 min-w-0 w-[100px]">
                    <MessageSquare className="h-4 w-4 shrink-0 text-white" />
                    <span className="truncate text-white">{chat.name}</span>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-100 text-white hover:text-white hover:bg-zinc-800/20"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingId(chat.id)
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-100 text-white hover:text-white hover:bg-zinc-800/20"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteChat(chat.id)
                      }}
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      </div>
    </div>
  )
}

