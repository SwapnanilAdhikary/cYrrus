const fs = require('fs');
const path = require('path');

// Load environment variables from Cyrus folder
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('🔍 Validating environment...');

const checks = [
  {
    name: 'Gemini API Key',
    check: () => process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here',
    message: 'Set GEMINI_API_KEY in .env file'
  },
  {
    name: 'GCP Project ID',
    check: () => process.env.GCP_PROJECT_ID && process.env.GCP_PROJECT_ID !== 'your_project_id_here',
    message: 'Set GCP_PROJECT_ID in .env file'
  },
  {
    name: 'Vertex AI Credentials',
    check: () => {
      const credPath = process.env.GCP_CREDENTIALS_PATH || path.join(__dirname, '../credentials/vertex-credentials.json');
      return fs.existsSync(credPath);
    },
    message: 'Place vertex-credentials.json in credentials/ directory'
  }
];

let allPassed = true;

checks.forEach(({ name, check, message }) => {
  if (check()) {
    console.log(`✅ ${name}`);
  } else {
    console.log(`❌ ${name} - ${message}`);
    allPassed = false;
  }
});

if (allPassed) {
  console.log('\n🎉 All checks passed! You can now run the app.');
} else {
  console.log('\n⚠️  Please fix the issues above before running the app.');
  process.exit(1);
}
