'use server'

import type { Message, MessageContent } from '@/types/chat'

export async function fetchTextModels() {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
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

export async function sendMessage(messages: Message[], textModel: string = "openai/gpt-oss-20b:free", userApiKey?: string) {
  try {
    // Convert messages to OpenAI format
    const openAIMessages = messages.map((message) => {
      if (message.role === 'system') {
        return {
          role: 'system' as const,
          content: typeof message.content === 'string' ? message.content : message.content[0]?.type === 'text' ? message.content[0].text : ''
        }
      }
      
      // Handle assistant messages - always convert to string
      if (message.role === 'ai') {
        return {
          role: 'assistant' as const,
          content: typeof message.content === 'string' ? message.content : JSON.stringify(message.content)
        }
      }
      
      // Handle user messages - can have images or be simple text
      return {
        role: 'user' as const,
        content: message.content // Keep as-is for user messages to support images
      }
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      // Use user's API key if provided, otherwise use environment key
      const apiKey = userApiKey || process.env.OPENROUTER_API_KEY;
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': process.env.SITE_URL || '',
          'X-Title': process.env.SITE_NAME || 'ArcGPT',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: textModel,
          messages: openAIMessages,
          max_tokens: 30000,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API Error:', response.status, errorText);
        
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error) {
            throw new Error(`OpenRouter Error: ${errorData.error.message || errorData.error}`);
          }
        } catch (parseError) {
          // If we can't parse the error, just throw the status
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
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
