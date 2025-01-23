# Frontend Setup Guide

## Environment Configuration
1. Create a `.env` file in the `frontend/` directory with the following Firebase and Google API credentials:

```
NEXT_PUBLIC_FIREBASE_API_KEY=xxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxxxxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxxxxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxxxxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxxxxxx
GOOGLE_API_KEY=xxxxxxx
```

## Development Setup

1. Navigate to the NextJS application directory:
```bash
cd frontend/
```

2. Start Genkit with TypeScript watch mode:
```bash
npx genkit start -- npx tsx --watch src/app/genkit/flows.ts
```

3. Launch the NextJS development server:
```bash
npm run dev
```

## Available Development URLs

- **Application UI**: [http://localhost:3000/notebooks](http://localhost:3000/notebooks)
- **Genkit Dev Interface**: [http://localhost:4000](http://localhost:4000) (for flow testing)

## Deployment

Firebase App Hosting deployment documentation coming soon.