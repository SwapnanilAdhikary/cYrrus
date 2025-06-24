// test-gemini.js (Node 18+ and 20+ compatible)

// Load environment variables from Cyrus folder
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${process.env.GEMINI_API_KEY}`;

async function askGemini(prompt) {
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

    console.log("🔁 Gemini raw response:\n", JSON.stringify(data, null, 2));

    const output = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("\n✅ Gemini Output:\n", output || "[Empty response]");

  } catch (err) {
    console.error("❌ Error calling Gemini API:", err);
  }
}

askGemini("Summarize the purpose of life in 1 sentence.");
