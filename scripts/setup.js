const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Cyrus Assistant...');

// Create credentials directory
const credentialsDir = path.join(__dirname, '../credentials');
if (!fs.existsSync(credentialsDir)) {
  fs.mkdirSync(credentialsDir, { recursive: true });
  console.log('✅ Created credentials directory');
}

// Copy .env.example to .env if it doesn't exist
const envExample = path.join(__dirname, '../.env.example');
const envFile = path.join(__dirname, '../.env');

if (!fs.existsSync(envFile) && fs.existsSync(envExample)) {
  fs.copyFileSync(envExample, envFile);
  console.log('✅ Created .env file from template');
}

console.log('\n📝 Next steps:');
console.log('1. Edit .env file with your API keys');
console.log('2. Place your Google Cloud credentials in the credentials/ directory');
console.log('3. Run "npm run validate" to check your setup');
console.log('4. Run "npm start" to launch the app');
