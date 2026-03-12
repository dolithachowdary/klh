import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import sql from '../db.js';

const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024 },
});

async function logToFile(msg) {
    const logPath = path.join(process.cwd(), 'server', 'debug.log');
    const timestamp = new Date().toISOString();
    try {
        await fs.appendFile(logPath, `[${timestamp}] ${msg}\n`);
    } catch (e) {
        console.error('Failed to write to log file', e);
    }
}

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = "You are a medical AI assistant generating patient-friendly reports.";

const REPORT_PROMPT = `
You are an AI clinical assistant.

Analyze the lab report text and create a human-friendly health report.

Tasks:

1. Identify lab markers and values
2. Detect abnormal results
3. Explain meaning in simple language
4. Highlight possible health risks
5. Provide recommendations
6. Maintain calm tone

Return JSON:

{
  "lab_name": "",
  "report_date": "",
  "overall_status": "",
  "summary": "",
  "findings": [
    {
      "name": "",
      "value": "",
      "reference_range": "",
      "status": "",
      "insight": ""
    }
  ],
  "health_risks": [],
  "recommendations": [],
  "doctor_advice": "",
  "disclaimer": ""
}

Lab Report Text:
---
{TEXT}
---
`;

/**
 * Send extracted text to Groq LLM (Llama 3.3 70b).
 */
async function analyseExtractedText(text, patient = {}) {
    // Inject patient context into the text if available so the AI knows who it's for.
    const patientCtx = patient.name
        ? `Patient: ${patient.name}, Age: ${patient.age || '?'}, Gender: ${patient.gender || '?'}, Conditions: ${(patient.conditions || []).join(', ') || 'None'}.\n`
        : '';

    const prompt = REPORT_PROMPT.replace('{TEXT}', patientCtx + text);

    const res = await fetch(GROQ_API, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: prompt }
            ],
            max_tokens: 1200,
            temperature: 0.2,
            response_format: { type: 'json_object' },
        }),
    });

    const data = await res.json();
    if (data.error) {
        throw new Error(data.error.message || JSON.stringify(data.error));
    }

    const raw = data.choices?.[0]?.message?.content || '{}';
    return JSON.parse(raw);
}

/**
 * Handle universal extraction (PDF/Images) via Gemini API.
 */
async function extractWithGemini(fileBuffer, mimeType, originalName) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing from environment variables.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Convert buffer to base64 string for the API inlineData format
    const base64Data = fileBuffer.toString('base64');

    await logToFile(`Sending ${originalName} (${mimeType}) to Gemini for extraction...`);

    const prompt = `You are an expert medical data extractor. 
Please carefully read this user-uploaded file (it could be a lab report, prescription, or medical summary in either PDF or image format).
Extract all visible text, numbers, dates, lab names, test results, and reference ranges.
Preserve the structure and context as much as possible so the data can be analyzed by a downstream system.
Do not hallucinate or add any medical advice. Just extract the contents accurately.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                { text: prompt }, // Gemini expects prompt as a part of contents array, not directly as first argument
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: mimeType
                    }
                }
            ]
        });

        return response.text; // Use the property, not a function
    } catch (error) {
        await logToFile(`GEMINI API ERROR: ${error.message}`);
        throw new Error(`Gemini Extraction Failed: ${error.message}`);
    }
}

// ── POST /api/upload/report ───────────────────────────────────────────────────
router.post('/report', upload.single('report'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    const { mimetype, originalname, buffer } = req.file;

    try {
        await logToFile(`--- New Upload: ${originalname} (${mimetype}) ---`);
        let extractedText = '';

        // Stage 1: Multimodal Extraction via Gemini 2.5 Flash
        await logToFile(`Starting Gemini extraction...`);
        extractedText = await extractWithGemini(buffer, mimetype, originalname);

        await logToFile(`Extraction complete. Length: ${extractedText?.length || 0}`);

        if (!extractedText || extractedText.trim().length < 5) {
            await logToFile('FAILED: Gemini extraction returned empty or too short text.');
            throw new Error('Could not extract meaningful text from the file. The document might be empty or unreadable.');
        }

        await logToFile(`Extracted text preview: ${extractedText.substring(0, 200).replace(/\n/g, ' ')}`);

        // Stage 2: Structured Generation via Groq (Llama 3.3)
        await logToFile(`Sending extracted text to Groq for structured JSON generation...`);

        let patient = {};
        try { patient = JSON.parse(req.body.patient || '{}'); } catch { }

        const report = await analyseExtractedText(extractedText, patient);
        await logToFile(`Analysis result for user ${patient.id || 'ANONYMOUS'}: ${report?.lab_name || 'Generic'}`);

        // Stage 3: Persist to Database
        if (patient.id) {
            await logToFile(`Attempting to save report for user: ${patient.id}`);
            try {
                const markersJson = JSON.stringify(report?.findings || []);
                const reportDate = report?.report_date && !isNaN(Date.parse(report.report_date)) 
                    ? new Date(report.report_date) 
                    : new Date();

                await sql`
                    INSERT INTO reports (
                        user_id, 
                        lab_name, 
                        report_date, 
                        summary, 
                        markers, 
                        risk_level
                    ) VALUES (
                        ${patient.id}, 
                        ${report?.lab_name || originalname}, 
                        ${reportDate}, 
                        ${report?.summary || ''}, 
                        ${markersJson}, 
                        ${report?.overall_status || 'Normal'}
                    )
                `;
                await logToFile(`SUCCESS: Report saved to database.`);
            } catch (dbErr) {
                await logToFile(`DATABASE ERROR: ${dbErr.message}`);
                console.error('DB Insert Error:', dbErr);
            }
        }

        res.json({ ok: true, report });

    } catch (err) {
        console.error('Analyse error:', err);
        res.status(500).json({ error: 'Failed to analyse the file: ' + err.message });
    }
});

export default router;
