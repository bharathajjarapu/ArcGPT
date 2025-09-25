'use server'

import type { Message, MessageContent } from '@/types/chat'

export async function fetchTextModels() {
  try {
    const response = await fetch('https://text.pollinations.ai/models', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching models:', error);
    return null;
  }
}

export async function sendMessage(messages: Message[], textModel: string = "openai") {
  try {
    // Convert messages to OpenAI format
    const openAIMessages = messages.map((message) => {
      if (message.role === 'system') {
        return {
          role: 'system' as const,
          content: typeof message.content === 'string' ? message.content : message.content[0]?.type === 'text' ? message.content[0].text : ''
        }
      }
      
      return {
        role: message.role === 'user' ? 'user' as const : 'assistant' as const,
        content: message.content
      }
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch('https://text.pollinations.ai/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: textModel,
          messages: openAIMessages,
          max_tokens: 300,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || null;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }
      throw error;
    }
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}
