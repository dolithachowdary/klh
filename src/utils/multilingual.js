export const LANGUAGE_CODE_MAP = {
  "Assamese": "as-IN",
  "Bengali": "bn-IN",
  "Bodo": "brx-IN",
  "Dogri": "doi-IN",
  "English": "en-IN",
  "Gujarati": "gu-IN",
  "Hindi": "hi-IN",
  "Kannada": "kn-IN",
  "Kashmiri": "ks-IN",
  "Konkani": "kok-IN",
  "Maithili": "mai-IN",
  "Malayalam": "ml-IN",
  "Manipuri": "mni-IN",
  "Marathi": "mr-IN",
  "Nepali": "ne-IN",
  "Odia": "od-IN",
  "Punjabi": "pa-IN",
  "Sanskrit": "sa-IN",
  "Santali": "sat-IN",
  "Sindhi": "sd-IN",
  "Tamil": "ta-IN",
  "Telugu": "te-IN",
  "Urdu": "ur-IN"
};

export const TTS_SUPPORTED_LANGUAGE_CODES = new Set([
  "hi-IN", "bn-IN", "ta-IN", "te-IN", "gu-IN", "kn-IN",
  "ml-IN", "mr-IN", "pa-IN", "od-IN", "en-IN"
]);

export const SUPPORTED_UI_LANGUAGES = [
  "Hindi",
  "Bengali",
  "Tamil",
  "Telugu",
  "Gujarati",
  "Kannada",
  "Malayalam",
  "Marathi",
  "Punjabi",
  "Odia",
  "English"
];

const API_BASE = window.location.origin.replace(':5173', ':3001');

export async function translateText(text, targetLanguageCode) {
  const response = await fetch(`${API_BASE}/api/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, target_language_code: targetLanguageCode }),
  });
  
  const data = await response.json();
  if (!response.ok) {
    const errorMessage = data.error?.message || data.details || data.error || "Translation failed";
    throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
  }
  return data.translatedText || data.text; // Assuming standard response format
}

export async function generateSpeech(text, targetLanguageCode) {
  const response = await fetch(`${API_BASE}/api/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, target_language_code: targetLanguageCode }),
  });
  
  const data = await response.json();
  if (!response.ok) {
    const errorMessage = data.error?.message || data.details || data.error || "TTS failed";
    throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
  }
  
  if (data.audios && data.audios.length > 0) {
    return data.audios[0];
  }
  return null;
}
