// Load environment variables from Cyrus folder
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const vision = require('@google-cloud/vision');
const path = require('path');

async function runOCR(imagePath) {
  const credentialsPath = process.env.OCR_CREDENTIALS_PATH || path.join(__dirname, '../credentials/ocr-credentials.json');

  const client = new vision.ImageAnnotatorClient({
    keyFilename: credentialsPath
  });

  try {
    const [result] = await client.textDetection(imagePath);
    const detections = result.textAnnotations;
    console.log('Detected text:');
    console.log(detections[0] ? detections[0].description : 'No text found');
  } catch (err) {
    console.error('OCR error:', err.message);
  }
}

// Replace with your test image path
runOCR('test2.png');
