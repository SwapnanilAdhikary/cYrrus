# Credentials Directory

This directory should contain your Google Cloud service account credentials.

## Required Files:
- `vertex-credentials.json` - For Vertex AI multimodal requests
- `ocr-credentials.json` - For OCR functionality

## How to get credentials:
1. Go to Google Cloud Console
2. Create a service account
3. Download the JSON key file
4. Place it in this directory with the appropriate name

## Security Note:
- These files are ignored by git
- Never commit credential files to version control
- Keep these files secure and private
