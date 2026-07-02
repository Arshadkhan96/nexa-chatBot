import express from 'express';
import { generate } from './chat-boat.js';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Main chat endpoint
app.post('/chat', async (req, res) => {
    let { messages, message } = req.body;

    // Handle single message format
    if (!messages || !Array.isArray(messages)) {
        if (message && typeof message === 'string') {
            messages = [
                {
                    role: 'user',
                    content: message
                }
            ];
        } else {
            return res.status(400).json({ error: 'Missing messages field' });
        }
    }

    try {
        const result = await generate(messages);

        return res.json({
            messages: result,
            message: result
        });

    } catch (err) {
        console.error('Error:', err);
        return res.status(500).json({
            error: 'Generation failed'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400) {
        return res.status(400).json({ error: 'Invalid JSON body' });
    }
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Nexa AI Server running on http://localhost:${PORT}`));
