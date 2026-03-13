import express from 'express';
import sql from '../db.js';
import { generateEmbedding } from '../embeddings.js';

const router = express.Router();

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';
const SYSTEM_PROMPT = `You are MediBot, an empathetic AI health assistant.

RAG CONTEXT (use this if relevant):
{CONTEXT}

RESPONSE FORMAT:
- Use short, clear sections with bold headers (e.g., **What this means:**)
- Use bullet points (•) for lists
- Use relevant emojis (💊 🩺 🥗 ⚠️ ✅ 📋)
- Max 120 words. End with a friendly medical disclaimer.`;

// POST /
router.post('/', async (req, res) => {
    let { messages, userId, reportContext } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'messages array required' });
    }

    const lastMsg = messages[messages.length - 1].content;

    try {
        // 1. Context: Use explicit report context if provided, else RAG Vector Search
        let context = "No specific report context found.";
        
        if (reportContext) {
            context = `Focus on this specific report: ${reportContext.brief || reportContext.report_name || 'Lab Report'}. 
            Summary: ${reportContext.summary || 'N/A'}. 
            Detailed Markers: ${JSON.stringify(reportContext.markers || [])}`;
        } else if (userId) {
            try {
                const queryEmb = await generateEmbedding(lastMsg);
                const matches = await sql`
                    SELECT brief, summary, markers 
                    FROM reports 
                    WHERE user_id = ${userId} 
                    ORDER BY embedding <=> ${JSON.stringify(queryEmb.slice(0, 768))}::vector
                    LIMIT 2
                `;
                if (matches.length > 0) {
                    context = matches.map(m => `Report: ${m.brief}. Summary: ${m.summary}. Data: ${JSON.stringify(m.markers)}`).join('\n\n');
                }
            } catch (vErr) {
                console.error('Vector Search Error:', vErr);
            }
        }

        // 2. LLM Call
        const response = await fetch(GROQ_API, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT.replace('{CONTEXT}', context) },
                    ...messages,
                ],
                temperature: 0.7,
                max_tokens: 400,
            }),
        });

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

        res.json({ reply });

    } catch (err) {
        console.error('Chat error:', err);
        res.status(500).json({ error: 'Failed to reach AI' });
    }
});

export default router;
