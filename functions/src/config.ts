import * as admin from 'firebase-admin';
import textToSpeech from "@google-cloud/text-to-speech";
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import { gemini15Flash } from "@genkit-ai/googleai";
import * as dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Load credentials from credentials.json file
const credentials = JSON.parse(fs.readFileSync('credentials.json', 'utf-8'));

if (!admin.apps.length) {
  const adminConfig: admin.AppOptions = {
    credential: admin.credential.cert(credentials)
  };
  admin.initializeApp(adminConfig);
}

export const firebaseAdmin = admin.app();
export const storage = firebaseAdmin.storage();

// Initialize Firestore
export const db = firebaseAdmin.firestore();

// Collection constants
export const JOBS_COLLECTION = "jobs";

export const tts = new textToSpeech.TextToSpeechClient({
  credentials: credentials
});

export const ai = genkit({
  plugins: [googleAI()],
  model: gemini15Flash,
});

// Export IS_EMULATOR from .env
export const IS_EMULATOR = process.env.IS_EMULATOR === 'true';