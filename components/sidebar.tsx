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
        "h-full bg-zinc-950 border-r border-border overflow-hidden transition-[width,min-width] duration-300 ease-in-out flex flex-col",
        isOpen ? "w-[200px] min-w-[200px]" : "w-0 min-w-0"
      )}
    >
      <div className="px-3 py-3">
        <Button 
          onClick={addNewChat} 
          variant="outline" 
          className="w-full justify-start gap-2 text-white px-2 py-2"
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
                "group flex items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors hover:bg-accent cursor-pointer w-full",
                chat.id === activeChatId && "bg-accent"
              )}
              onClick={() => setActiveChatId(chat.id)}
            >
              {editingId === chat.id ? (
                <Input
                  autoFocus
                  defaultValue={chat.name}
                  className="h-7 bg-background text-white w-full"
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
                      className="h-6 w-6 opacity-100 text-white hover:text-white hover:bg-zinc-800"
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
                      className="h-6 w-6 opacity-100 text-white hover:text-white hover:bg-zinc-800"
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
  )
}

