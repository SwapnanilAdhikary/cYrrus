const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { GoogleAuth } = require('google-auth-library');
const {
  GEMINI_API_KEY,
  GCP_PROJECT_ID,
  GCP_REGION,
  GCP_MODEL,
  GCP_CREDENTIALS_PATH
} = require('./env');

// 🔹 Gemini text-only endpoint (API key-based)
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${GEMINI_API_KEY}`;

async function askGemini(prompt, imageBase64 = null) {
  if (!imageBase64) {
    // 🔹 TEXT-ONLY MODE (Public Gemini API)
    try {
      const response = await fetch(GEMINI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error("❌ Gemini API error:", data.error);
        return `[API Error] ${data.error.message || 'Unknown error'}`;
      }

      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "[Empty response]";
    } catch (err) {
      console.error("❌ Gemini API error:", err.message);
      return "[Gemini failed]";
    }
  } else {
    // 🔸 IMAGE + TEXT MODE (GCP Vertex AI multimodal endpoint)
    try {
      // Check if credentials file exists
      if (!fs.existsSync(GCP_CREDENTIALS_PATH)) {
        console.error(`❌ Credentials file not found: ${GCP_CREDENTIALS_PATH}`);
        return "[Credentials file missing]";
      }

      const auth = new GoogleAuth({
        keyFile: GCP_CREDENTIALS_PATH,
        scopes: 'https://www.googleapis.com/auth/cloud-platform',
      });

      const client = await auth.getClient();
      const token = await client.getAccessToken();

      const endpoint = `https://${GCP_REGION}-aiplatform.googleapis.com/v1/projects/${GCP_PROJECT_ID}/locations/${GCP_REGION}/publishers/google/models/${GCP_MODEL}:generateContent`;

      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: 'image/png',
                  data: imageBase64,
                },
              },
            ],
          },
        ],
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.error) {
        console.error("❌ Vertex Error:", data.error);
        return `[Vertex Error] ${data.error.message || JSON.stringify(data.error)}`;
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return text || '[Empty Gemini vision response]';
    } catch (err) {
      console.error("❌ GCP Gemini vision request failed:", err.message);
      return "[GCP Vision failed]";
    }
  }
}

module.exports = { askGemini };
