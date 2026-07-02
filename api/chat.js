import { generate } from '../backend/chat-boat.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { messages, message } = req.body;
  let inputMessages = messages;

  if (!Array.isArray(inputMessages)) {
    if (message && typeof message === 'string') {
      inputMessages = [
        {
          role: 'user',
          content: message
        }
      ];
    } else {
      res.status(400).json({ error: 'Missing messages field' });
      return;
    }
  }

  try {
    const result = await generate(inputMessages);
    res.status(200).json({ message: result, messages: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Generation failed' });
  }
}
