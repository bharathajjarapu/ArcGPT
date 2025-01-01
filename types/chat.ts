export type ChatTab = {
  id: string
  name: string
}

export type Message = {
  id: string
  content: string
  role: 'user' | 'ai' | 'system'
  agent?: string | null
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

