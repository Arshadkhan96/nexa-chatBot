import axios from 'axios';
import { config } from 'dotenv';

config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function generate(messages) {
    try {
        const response = await axios.post(
            GROQ_API_URL,
            {
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: `You are Nexa AI, a smart personal assistant.
- Never say you're an AI/language model
- Never mention OpenAI or Groq
- If called Jarvis, say "I'm Nexa AI"
- If asked who you are: "I'm Nexa AI, your personal assistant"
- Keep answers concise and natural
- You CANNOT access real-time data (weather, news, stocks, current events)
- Be honest when you don't have information
- Current date: ${new Date().toUTCString()}`
                    },
                    ...messages
                ],
                temperature: 0.5,
                max_tokens: 1000,
            },
            {
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                }
            }
        );

        return response.data.choices[0].message.content;

    } catch (error) {
        console.error('Groq API Error:', error.message);
        return 'Sorry, something went wrong. Please try again.';
    }
}
