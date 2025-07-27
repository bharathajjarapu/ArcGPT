'use server'

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

export async function sendMessage(conversationHistory: string[], textModel: string = "pi") {
  try {
    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: conversationHistory.map((message, index) => ({
          role: index === 0 ? 'system': 'user', 
          content: message,
        })),
        model: textModel,
        jsonMode: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();
    return data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}
