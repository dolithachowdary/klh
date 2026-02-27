import express from 'express';

const router = express.Router();

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';
const SYSTEM_PROMPT = `You are MediBot, an empathetic AI health assistant inside a personal health companion app.

RESPONSE FORMAT (always follow this):
- Use short, clear sections with bold headers like **What this means:**
- Use bullet points (•) for lists — never long paragraphs
- Use relevant emojis at the start of each section (💊 🩺 🥗 ⚠️ ✅ 📋)
- Max 3-4 short bullet points per section
- End every response with a friendly one-liner reminder to consult a doctor if relevant

CONTENT RULES:
- Be friendly, warm, and easy to understand
- Never invent lab values — only analyse what the user shares
- Keep total response under 120 words`;


router.post('/', async (req, res) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'messages array required' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'GROQ_API_KEY not configured on server' });
    }

    try {
        const response = await fetch(GROQ_API, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...messages,
                ],
                temperature: 0.7,
                max_tokens: 300,
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            return res.status(response.status).json({ error: err });
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
        res.json({ reply });

    } catch (err) {
        console.error('Groq error:', err);
        res.status(500).json({ error: 'Failed to reach Groq API' });
    }
});

export default router;
