import express from 'express';
import sql from '../db.js';

const router = express.Router();
const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Core report summary generator — mirrors the Python API:
 *   generate_report_summary(patient, lab_results) → string
 */
async function generate_report_summary(patient, lab_results) {
    const labText = lab_results.map(l =>
        `• ${l.name}: ${l.value} ${l.unit} (reference: ${l.reference_range})`
    ).join('\n');

    const prompt = `
Patient Profile:
- Age: ${patient.age}
- Gender: ${patient.gender}
- Known Conditions: ${(patient.conditions || []).join(', ') || 'None'}

Lab Results:
${labText}

Generate a concise, structured medical report summary for this patient based on the lab results above.
Include:
1. **Overview** — Brief overall health status
2. **Abnormal Findings** — List any out-of-range values and their clinical significance
3. **Recommendations** — Actionable next steps (diet, follow-up tests, lifestyle)
4. **Risk Assessment** — Any heightened risks given the patient's conditions

Keep the tone professional but friendly yet easy to understand for the patient. Use bold headers and bullet points.`;

    const res = await fetch(GROQ_API, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: 'You are a medical AI assistant that generates clear, accurate, and structured lab report summaries for patients. Always be factual and recommend consulting a doctor for treatment decisions.'
                },
                { role: 'user', content: prompt }
            ],
            max_tokens: 800,
            temperature: 0.4,
        }),
    });

    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'Unable to generate summary.';
}


// POST /api/report/summary
router.post('/summary', async (req, res) => {
    const { patient, lab_results } = req.body;

    if (!patient || !lab_results || !Array.isArray(lab_results)) {
        return res.status(400).json({ error: 'patient and lab_results (array) are required.' });
    }

    try {
        const summary = await generate_report_summary(patient, lab_results);
        res.json({ summary });
    } catch (err) {
        console.error('Report generation error:', err.message);
        res.status(500).json({ error: 'Failed to generate report summary.' });
    }
});

// GET /api/report/user/:userId
router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const reports = await sql`
            SELECT * FROM reports 
            WHERE user_id = ${userId} 
            ORDER BY report_date DESC, created_at DESC
        `;
        res.json(reports);
    } catch (err) {
        console.error('Fetch reports error:', err.message);
        res.status(500).json({ error: 'Failed to fetch reports.' });
    }
});

export default router;
