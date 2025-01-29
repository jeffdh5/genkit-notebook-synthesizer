# Frontend Setup Guide

## Environment Configuration
1. Create a `.env` file in the `frontend/` directory with the following Firebase and Google API credentials:
```
NEXT_PUBLIC_FIREBASE_API_KEY=XXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=XXXXX.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=XXXXX
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=XXXXX.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=XXXXX
NEXT_PUBLIC_FIREBASE_APP_ID=XXXXX
NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR=true
```

2. Create a `.env` file in the `functions/` directory with the following Firebase and Google API credentials:

```
GOOGLE_API_KEY=XXXXX
PROJECT_ID=XXXXX
FB_ADMIN_CLIENT_EMAIL=XXXXX@XXXXX.iam.gserviceaccount.com
FB_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXXXX\n-----END PRIVATE KEY-----\n"
FB_ADMIN_STORAGE_BUCKET=XXXXX.firebasestorage.app

# Google Auth Credentials
GOOGLE_AUTH_TYPE=service_account
GOOGLE_PRIVATE_KEY_ID=XXXXX
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXXXX\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=XXXXX@XXXXX.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=XXXXX
GOOGLE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
GOOGLE_TOKEN_URI=https://oauth2.googleapis.com/token
GOOGLE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
GOOGLE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/XXXXX@XXXXX.iam.gserviceaccount.com
GOOGLE_UNIVERSE_DOMAIN=googleapis.com
```

## Development Setup

1. Navigate to the NextJS application directory and initiate the frontend:
```bash
cd frontend; npm run dev
```

2. In a separate terminal, start Genkit Dev UI + Flows Server with TypeScript watch mode:
```bash
cd functions; npx genkit start -- npx tsx --watch src/flows.ts
```

3. In a separate terminal, run the build command in watch mode for Functions emulator to automatically pick up new changes: 
```bash
npm run build:watch
```

4. In a separate terminal, launch the Firebase emulator:
```bash
firebase emulators:start --only=functions
```

## Local Development Flow

When developing locally, the frontend application can be configured to point to either the Firebase emulator or the deployed Cloud Functions, depending on the value of the `NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR` environment variable.

1. **Using Firebase Emulator:**
   - If `NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR=true` in the `frontend/.env` file, the frontend will point to the local Firebase emulator for callable functions.
   - This allows you to test your functions locally without deploying them to Firebase.
   - To start the emulator, run the following command in the `functions` directory:
     ```bash
     cd functions; firebase emulators:start --only=functions
     ```

2. **Using Deployed Cloud Functions:**
   - If `NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR=false` or the variable is not set, the frontend will point to the deployed callable Cloud Function in your Firebase project.
   - This is useful for testing the integration with the live environment.
   - Ensure that your Cloud Function `generatePodcast` is deployed and accessible.

### Steps to Run the Development Environment:

1. **Navigate to the NextJS application directory and initiate the frontend:**
   ```bash
   cd frontend/; npm run dev
   ```

2. **In a separate terminal, start Genkit with TypeScript watch mode:**
   ```bash
   npx genkit start -- npx tsx --watch functions/src/flows.ts
   ```

3. **Launch the Firebase emulator (if using the emulator):**
   ```bash
   cd functions; firebase emulators:start --only=functions
   ```

By following these steps, you can effectively develop and test your application locally, switching between the emulator and the deployed Cloud Functions as needed.


## Available Development URLs

- **Application UI**: [http://localhost:3000/notebooks](http://localhost:3000/notebooks)
- **Genkit Dev UI**: [http://localhost:4000](http://localhost:4000) (for flow testing)

## Deployment

Documentation for Firebase App Hosting deployment will be provided soon.