require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const fs = require('fs');
const fetch = require('node-fetch');
const { GoogleAuth } = require('google-auth-library');

const PROJECT_ID = process.env.GCP_PROJECT_ID;
const REGION = process.env.GCP_REGION || 'us-central1';
const MODEL = process.env.GCP_MODEL || 'gemini-2.5-pro';
const CREDENTIALS_PATH = process.env.GCP_CREDENTIALS_PATH || './credentials/vertex-credentials.json';

async function main() {
  const auth = new GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: 'https://www.googleapis.com/auth/cloud-platform',
  });

  const client = await auth.getClient();
  const token = await client.getAccessToken();

  const imageBytes = fs.readFileSync('C:/Users/adhik/Desktop/Cluey 2.0/test/test2.png').toString('base64');

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: "What's happening in this screenshot?",
          },
          {
            inlineData: {
              mimeType: "image/png",
              data: imageBytes,
            },
          },
        ],
      },
    ]
  };

  const res = await fetch(`https://${REGION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${REGION}/publishers/google/models/${MODEL}:generateContent`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const result = await res.json();
  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
