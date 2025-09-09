"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Sidebar from '@/components/sidebar'
import Chat from '@/components/chat'
import { Onboarding } from '@/components/onboarding'
import { ChatTab } from '@/types/chat'

export default function Home() {
  const [isOpen, setIsOpen] = useState(false)
  const [chatTabs, setChatTabs] = useState<ChatTab[]>([
    { id: '1', name: 'Chat' }
  ])
  const [activeChatId, setActiveChatId] = useState('1')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
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

  useEffect(() => {
    localStorage.setItem('chatTabs', JSON.stringify(chatTabs))
  }, [chatTabs])

  const addNewChat = () => {
    const newChat: ChatTab = {
      id: Date.now().toString(),
      name: 'Chat'
    }
    const updatedChatTabs = [...chatTabs, newChat]
    setChatTabs(updatedChatTabs)
    setActiveChatId(newChat.id)
    localStorage.setItem('chatTabs', JSON.stringify(updatedChatTabs))
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
    if (activeChatId === id) {
      setActiveChatId(updatedChatTabs[0]?.id || '')
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
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    setShowContent(true)
  }

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  return (
    <motion.div
      className="flex h-screen bg-black"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
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
    </motion.div>
  )
}
