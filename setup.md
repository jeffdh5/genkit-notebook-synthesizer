# Setup Guide
## Environment Configuration
1. Drop your Firebase configuration in `webapp/src/app/firebase.ts`. (Replace the placeholder values with your Firebase project configuration.)

2. Create a `.env` file in the `webapp/` directory with the following enviroenvnment variables:

```
NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR=true
```

2. Create a `.env` file in the `functions/` directory with the following env variables:

```
GOOGLE_API_KEY=XXXXX
IS_EMULATOR=true
```

## Development Setup
1. Install dependencies in both the frontend and functions directories:
   ```bash
   cd frontend/; npm install
   cd ../functions/; npm install
   ```

## Local Development Flow

When developing locally, the frontend application can be configured to point to either the Firebase emulator or the deployed Cloud Functions, depending on the value of the `NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR` environment variable.

1. **Using Firebase Emulator:**
   - If `NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR=true` in the `frontend/.env` file, the frontend will point to the local Firebase emulator for callable functions.
   - This allows you to test your functions locally without deploying them to Firebase.
   - To start the emulator, run the following command in the `functions` directory:
     ```bash
     firebase emulators:start --only=functions
     ```

2. **Using Deployed Cloud Functions:**
   - If `NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR=false` or the variable is not set, the frontend will point to the deployed callable Cloud Function in your Firebase project.
   - This is useful for testing the integration with the live environment.
   - Ensure that your Cloud Function `generatePodcast` is deployed and accessible.
   - You may run into a CORS issue; please add `allUsers` as a principal on the Cloud Function and add the `Cloud Run Invoker` role inside Google Cloud Console.


NOTE:
- Cloud Tasks Admin, Service Account Token Creator, Storage Admin role to Firebase Admin SDK service account
- Service Account Admin to App Engine default service account
- Service Account Admin to Compute default service account
(Not exactly sure.. need to go back and verify - just remember CORS was a struggle and we need to go back and isolate the exact roles needed)

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