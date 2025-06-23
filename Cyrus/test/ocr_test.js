const vision = require('@google-cloud/vision');
const path = require('path');

async function runOCR(imagePath) {
  const client = new vision.ImageAnnotatorClient({
    keyFilename: path.join(__dirname, 'credentials.json')
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
