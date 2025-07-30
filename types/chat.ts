export type ChatTab = {
  id: string
  name: string
}

export type MessageContent = 
  | string
  | Array<{
      type: 'text'
      text: string
    } | {
      type: 'image_url'
      image_url: {
        url: string
      }
    }>

export type Message = {
  id: string
  content: MessageContent
  role: 'user' | 'ai' | 'system'
  agent?: string | null
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

