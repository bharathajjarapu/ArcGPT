"use client"

import { useState, useEffect } from 'react'
import Sidebar from '@/components/sidebar'
import Chat from '@/components/chat'
import { Onboarding } from '@/components/onboarding'
import { ChatTab } from '@/types/chat'

export default function Home() {
  const [isOpen, setIsOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [chatTabs, setChatTabs] = useState<ChatTab[]>([
    { id: '1', name: 'Chat' }
  ])
  const [activeChatId, setActiveChatId] = useState('1')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    setHydrated(true)

    const savedChatTabs = localStorage.getItem('chatTabs')
    if (savedChatTabs) {
      setChatTabs(JSON.parse(savedChatTabs))
    }

    const onboardingComplete = localStorage.getItem('onboardingComplete')
    if (!onboardingComplete) {
      setShowOnboarding(true)
    } else {
      setShowContent(true)
    }
  }, [])

  // Restore active chat ID after chatTabs are loaded
  useEffect(() => {
    if (chatTabs.length > 0) {
      const savedActiveChatId = localStorage.getItem('activeChatId')
      if (savedActiveChatId && chatTabs.some(chat => chat.id === savedActiveChatId)) {
        setActiveChatId(savedActiveChatId)
      } else if (!savedActiveChatId) {
        // If no saved active chat ID, default to the first chat
        setActiveChatId(chatTabs[0].id)
      }
    }
  }, [chatTabs])

  useEffect(() => {
    localStorage.setItem('chatTabs', JSON.stringify(chatTabs))
  }, [chatTabs])

  // Save active chat ID to localStorage whenever it changes
  useEffect(() => {
    if (activeChatId) {
      localStorage.setItem('activeChatId', activeChatId)
    }
  }, [activeChatId])

  const addNewChat = () => {
    const newChat: ChatTab = {
      id: Date.now().toString(),
      name: 'Chat'
    }
    const updatedChatTabs = [...chatTabs, newChat]
    setChatTabs(updatedChatTabs)
    setActiveChatId(newChat.id)
    localStorage.setItem('chatTabs', JSON.stringify(updatedChatTabs))
    localStorage.setItem('activeChatId', newChat.id)
  }

  const editChatName = (id: string, newName: string) => {
    const updatedChatTabs = chatTabs.map(chat => 
      chat.id === id ? { ...chat, name: newName } : chat
    )
    setChatTabs(updatedChatTabs)
    localStorage.setItem('chatTabs', JSON.stringify(updatedChatTabs))
  }

  const deleteChat = (id: string) => {
    const updatedChatTabs = chatTabs.filter(chat => chat.id !== id)
    setChatTabs(updatedChatTabs)
    localStorage.setItem('chatTabs', JSON.stringify(updatedChatTabs))
    localStorage.removeItem(`chat_${id}`)

    // Handle active chat ID update
    if (activeChatId === id) {
      const newActiveId = updatedChatTabs[0]?.id || ''
      setActiveChatId(newActiveId)
      // Also update localStorage to persist the active chat ID
      if (newActiveId) {
        localStorage.setItem('activeChatId', newActiveId)
      } else {
        localStorage.removeItem('activeChatId')
      }
    }
  }

  const forkChat = () => {
    const originalChat = chatTabs.find(chat => chat.id === activeChatId);
    if (!originalChat) return;

    const newChatId = Date.now().toString();
    const newChatName = `${originalChat.name} (Fork)`;
    const newChat: ChatTab = {
      id: newChatId,
      name: newChatName
    };

    const updatedChatTabs = [...chatTabs, newChat];
    setChatTabs(updatedChatTabs);
    setActiveChatId(newChatId);

    const originalChatHistory = localStorage.getItem(`chat_${activeChatId}`);
    if (originalChatHistory) {
      localStorage.setItem(`chat_${newChatId}`, originalChatHistory);
    }

    localStorage.setItem('chatTabs', JSON.stringify(updatedChatTabs));
    localStorage.setItem('activeChatId', newChatId);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    setShowContent(true)
  }

  if (!hydrated) {
    return null
  }

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  return (
    <div
      className="flex h-screen bg-black animate-scaleIn"
    >
      {showContent && (
        <>
          <Sidebar
            isOpen={isOpen}
            chatTabs={chatTabs}
            activeChatId={activeChatId}
            setActiveChatId={setActiveChatId}
            addNewChat={addNewChat}
            editChatName={editChatName}
            deleteChat={deleteChat}
          />
          <Chat
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            activeChatId={activeChatId}
            onFork={forkChat}
            chatTabs={chatTabs}
            setChatTabs={setChatTabs}
            onNewChat={addNewChat}
          />
        </>
      )}
    </div>
  )
}
