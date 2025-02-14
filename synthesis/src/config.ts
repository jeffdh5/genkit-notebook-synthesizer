import * as admin from 'firebase-admin';
import textToSpeech from "@google-cloud/text-to-speech";
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import { gemini15Flash } from "@genkit-ai/googleai";
import * as dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

export const USE_CLOUD_STORAGE = false;
export const USE_FIRESTORE = false;
let db: admin.firestore.Firestore | null;
let firebaseAdmin: admin.app.App | null;
let storage: admin.storage.Storage | null;

// Load credentials from credentials.json file
const credentials = JSON.parse(fs.readFileSync('credentials.json', 'utf-8'));

if (USE_CLOUD_STORAGE || USE_FIRESTORE) {
    if (!admin.apps.length) {
        const adminConfig: admin.AppOptions = {
          credential: admin.credential.cert(credentials)
        };
        admin.initializeApp(adminConfig);
    }
    firebaseAdmin = admin.app();
    storage = firebaseAdmin.storage();
    db = firebaseAdmin.firestore();
} else {
    firebaseAdmin = null;
    storage = null;
    db = null;
}

export { firebaseAdmin,storage, db}

// Collection constants
export const JOBS_COLLECTION = "jobs";

export const tts = new textToSpeech.TextToSpeechClient({
  credentials: credentials
});

export const ai = genkit({
  plugins: [googleAI()],
  model: gemini15Flash,
});
