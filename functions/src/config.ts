import * as admin from 'firebase-admin';
import textToSpeech from "@google-cloud/text-to-speech";
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import { gemini15Flash } from "@genkit-ai/googleai";
import * as dotenv from 'dotenv';

dotenv.config();

export const PROJECT_ID = process.env.PROJECT_ID;
export const FB_ADMIN_CLIENT_EMAIL = process.env.FB_ADMIN_CLIENT_EMAIL;
export const FB_ADMIN_PRIVATE_KEY = process.env.FB_ADMIN_PRIVATE_KEY;
export const FB_ADMIN_STORAGE_BUCKET = process.env.FB_ADMIN_STORAGE_BUCKET;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: PROJECT_ID,
      clientEmail: FB_ADMIN_CLIENT_EMAIL,
      privateKey: FB_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: FB_ADMIN_STORAGE_BUCKET,
  });
}

export const firebaseAdmin = admin.app();
export const storage = firebaseAdmin.storage();

// Initialize Firestore
export const db = firebaseAdmin.firestore();

// Replace the credentials.json loading with environment variables
const googleAuthConfig = {
  type: process.env.GOOGLE_AUTH_TYPE || 'service_account',
  project_id: PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: process.env.GOOGLE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
  token_uri: process.env.GOOGLE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL,
};

export const tts = new textToSpeech.TextToSpeechClient(googleAuthConfig);

export const ai = genkit({
  plugins: [googleAI()],
  model: gemini15Flash,
});