import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import pdf from 'pdf-parse';
import { generate } from './chat-boat.js';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.resolve(__dirname, '../frontend');
const upload = multer({ storage: multer.memoryStorage() });

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(frontendPath));

// PDF upload endpoint
app.post(['/upload', '/api/upload'], upload.single('pdf'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No PDF uploaded' });
    }

    try {
        const data = await pdf(req.file.buffer);
        const text = data.text || '';

        return res.json({
            fileName: req.file.originalname,
            text: text.trim()
        });
    } catch (err) {
        console.error('PDF parse error:', err);
        return res.status(500).json({ error: 'Failed to process PDF' });
    }
});

// Main chat endpoint
app.post(['/chat', '/api/chat'], async (req, res) => {
    let { messages, message, pdfText } = req.body;

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
        const result = await generate(messages, pdfText);

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

// Serve the frontend for any other route
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Nexa AI Server running on http://localhost:${PORT}`));
