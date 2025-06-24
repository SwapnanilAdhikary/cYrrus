const path = require('path');

// Load environment variables using dotenv from Cyrus folder
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Validate required environment variables
function validateEnv() {
  const required = ['GEMINI_API_KEY', 'GCP_PROJECT_ID', 'GCP_REGION'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    console.error('📝 Please copy .env.example to .env and fill in your values');
    process.exit(1);
  }
}

validateEnv();

module.exports = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GCP_PROJECT_ID: process.env.GCP_PROJECT_ID,
  GCP_REGION: process.env.GCP_REGION || 'us-central1',
  GCP_MODEL: process.env.GCP_MODEL || 'gemini-2.5-pro',
  GCP_CREDENTIALS_PATH: process.env.GCP_CREDENTIALS_PATH || path.join(__dirname, '../../credentials/vertex-credentials.json'),
  OCR_CREDENTIALS_PATH: process.env.OCR_CREDENTIALS_PATH || path.join(__dirname, '../../credentials/ocr-credentials.json')
};
