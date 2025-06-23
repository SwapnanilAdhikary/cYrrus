const fs = require('fs');
const fetch = require('node-fetch');
const { GoogleAuth } = require('google-auth-library');

// 🔹 Gemini text-only endpoint (API key-based)
const GEMINI_API_KEY = 'AIzaSyBn5_Ll3_WuWuadIQsn00fKAYLCe0kTVp4';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${GEMINI_API_KEY}`;

// 🔸 Gemini multimodal (image+text) via GCP Vertex AI
const GCP_PROJECT_ID = 'key-beacon-463806-s2';
const GCP_REGION = 'us-central1';
const GCP_MODEL = 'gemini-2.5-pro';
const GCP_CREDENTIALS_PATH = 'C://Users//adhik//Desktop//Cluey 2.0//test//credentials_vertex.json';

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
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "[Empty response]";
    } catch (err) {
      console.error("❌ Gemini API error:", err);
      return "[Gemini failed]";
    }
  } else {
    // 🔸 IMAGE + TEXT MODE (GCP Vertex AI multimodal endpoint)
    try {
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
      console.log("🔍 GCP Gemini raw response:", JSON.stringify(data, null, 2));

      if (data.error) {
        console.error("❌ Vertex Error:", data.error);
        return `[Vertex Error] ${data.error.message || JSON.stringify(data.error)}`;
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log("✅ Extracted Gemini response:", text);

      return text || '[Empty Gemini vision response]';
    } catch (err) {
      console.error("❌ GCP Gemini vision request failed:", err);
      return "[GCP Vision failed]";
    }
  }
}

module.exports = { askGemini };
