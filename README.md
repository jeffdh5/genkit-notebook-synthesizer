# Open-Source NotebookLM Starter Kit  

Build your own NotebookLM-style application with our ready-to-use starter kit.

See a hosted demo of a NotebookLM clone, developed using this project: https://webapp--smarthome-d6e27.us-central1.hosted.app/notebooks (click into one of the pre-existing notebooks and click `Generate`)

## Prerequisites
Before getting started, you'll need:

1. **Enable Cloud Text-to-Speech API**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Select your project
   - Navigate to "APIs & Services" > "Library" 
   - Search for "Cloud Text-to-Speech API"
   - Click "Enable"

2. **Get a Makersuite API Key**
   - Visit [Google AI Studio](https://makersuite.google.com)
   - Click "Get API Key" in the top right
   - Create a new API key or use an existing one
   - Copy the API key - you'll need this for the `.env` file
3. **Firebase Project**
   - A Firebase project with Blaze (pay-as-you-go) plan enabled
   - Firebase CLI installed (`npm install -g firebase-tools`)
   - Logged in to Firebase (`firebase login`)
   - Enable Firestore Database in your Firebase Console (in test mode)
   - Enable Cloud Storage in your Firebase Console (in test mode)

## Quickstart
Here's how can you can quickly get started and see your first podcast uploaded to Cloud Storage:

1. Create a .env file:
```bash
vim functions/.env
```

2. Grab your API Key from makersuite.google.com, and paste it in the .env:
```bash
GOOGLE_API_KEY=xxxxx
```

3. Go to Firebase Console, navigate to Project Settings > Service Accounts, click "Generate New Private Key" to download your admin SDK credentials as a JSON file. Save this file as `credentials.json` in your `functions/` directory.

4. Run the test command:
```bash
cd functions
ts-node src/scripts/testPodcastTemplates.ts
```
## Local Development
For detailed setup instructions, please see [setup.md](setup.md).

## What's Included?  
- **AI-powered synthesis utilities** – Out-of-the-box utilities for converting diverse input sources (**PDFs**, **text**, and more coming soon) into structured, consumable audio formats like **roundtable discussions, formal debates, and expert interviews**. (Available as `npm` package but source code lives here). This codebase is meant to be used as a starting point for your own customizable pipelines.
- **Serverless backend (Cloud Run)** – Built to deploy on Cloud Run, so you can easily spin up a Serverless API that your frontends can consume.
- **Next.js boilerplate UI** – So that you can build your own NotebookLM-inspired experience. Easily deployable to Firebase App Hosting.

Get started quickly, customize as needed, and bring AI-powered research synthesis to your own applications.  

## Key Features  
- **Prebuilt AI Pipelines** – Summarization, Q&A, podcast scripts, structured reports  
- **Multi-Format Outputs** – Synthesize your raw input sources into podcasts, debates, FAQs, and more note formats  
- **Multi-Agent AI Synthesis** – Generate interactive discussions that highlight disparate viewpoints (e.g., AI scientist debates AI journalist)  
- **Firebase & Serverless-Friendly** – Deploy easily on Firebase, Google Cloud, or run locally  
- **Extensible & Customizable** – Swap LLMs, tweak synthesis logic, and extend with your own transformations by following the existing pattern

## Who is This For?  

This starter kit is designed for **developers, startups, and researchers** looking to integrate **AI-powered content synthesis** into their applications without building everything from scratch.  

### Ideal Users  

✅ **Indie AI SaaS Builders**  
- Want to build AI-powered **podcast generation tools** that create engaging roundtables, interviews, and debates.
- Looking to expand into other **engaging content formats** like interactive FAQs and study guides.
- Need a **Firebase-friendly** solution to deploy quickly.

✅ **Developers Building AI-Powered Content Tools**  
- Want to transform documents and transcripts into **engaging audio discussions and structured learning materials.**
- Need a **prebuilt pipeline** for generating natural-sounding podcasts, with plans to support other interactive formats.
- Prefer **a modular, extendable system** rather than writing everything manually.

✅ **Researchers & Educators**  
- Need to **turn research papers and materials into engaging audio discussions** that students will actually consume.
- Want to eventually support generating **interactive study guides and Q&A formats** that make learning more engaging.
- Looking for **an open-source alternative to NotebookLM** that prioritizes engaging, multi-format content.

✅ **Startups & Companies Experimenting with AI**  
- Want to **quickly prototype AI podcast generation** with plans to expand into other engaging content formats.
- Need **a flexible system** that allows customizing voices, discussion styles, and content formats.
- Prefer a **serverless, Firebase-compatible backend** that scales without DevOps overhead.

## Detailed Usage
You can easily generate AI-powered podcasts from any text content by configuring the synthesis options. The system is flexible and can handle various podcast formats including:

1. One-on-one interviews
2. Multi-speaker roundtables 
3. Moderated panel discussions
4. And more...

To generate a podcast:

1. Create a podcast configuration object defining your desired format and speakers (see examples below)
2. Prepare your input text (can be a PDF, string, or array of strings)
3. Call the synthesis function:

```
// Roundtable podcast
// Custom speakers with specified TTS voices
// Includes a moderator
export const simpleRoundtableConfig = {
  format: "roundtable",
  title: "ai-trends-roundtable",
  speakers: [
    {
      name: "Dr. Sarah Chen",
      voiceId: "en-US-Neural2-F",
      background: "AI Researcher"
    },
    {
      name: "Mark Thompson",
      voiceId: "en-US-Neural2-D",
      background: "Tech Journalist"
    },
    {
      name: "Lisa Wong",
      voiceId: "en-US-Journey-F",
      background: "AI Ethics Expert"
    }
  ],
  moderator: {
    name: "Michael Brooks",
    voiceId: "en-US-Journey-D",
    style: "facilitating"
  },
  discussionStyle: "expert_panel",
  structure: "moderated_topics",
  bucketName: "your-storage-bucket.appspot.com",
  transcriptStorage: "transcripts",
  audioStorage: "audio"
};
```


The above example shows a roundtable discussion format with multiple expert speakers and a moderator. The configuration specifies speaker backgrounds, voice IDs for text-to-speech, discussion style, and storage locations for the generated content.

Below is an example of a one-on-one interview format, where a tech reporter interviews an AI researcher:

```
// Interview podcast
// Tech reporter interviewing an AI Reseracher
export const simpleInterviewConfig = {
  format: "interview",
  title: "ai-expert-interview",
  speakers: [
    {
      name: "Dr. James Wilson",
      voiceId: "en-US-Neural2-D",
      background: "AI Research Director"
    },
    {
      name: "Emily Parker",
      voiceId: "en-US-Journey-F",
      background: "Tech Reporter"
    }
  ],
  interviewStyle: "freeform",
  intervieweeName: "Dr. James Wilson",
  topic: "Future of AI Technology",
  maxQuestions: 5,
  bucketName: "your-storage-bucket.appspot.com",
  transcriptStorage: "transcripts",
  audioStorage: "audio"
};
```

The above example demonstrates a simple interview format with two speakers, where a tech reporter conducts a focused interview with an AI researcher. The configuration includes speaker details, interview style preferences, and topic focus.

Below is an example of an ethical debate format, which facilitates a structured discussion between two experts with opposing viewpoints on AI development:

```
export const ethicalDebateConfig = {
  format: "debate",
  title: "ethical-debate",
  speakers: [
    { 
      name: "Professor Smith", 
      voiceId: "en-US-Journey-D",
      background: "AI Safety Expert at Oxford" 
    },
    { 
      name: "Dr. Zhang", 
      voiceId: "en-US-Neural2-D",
      background: "AI Development Lead at OpenAI" 
    }
  ],
  debateTopic: "AI Safety vs Innovation Speed",
  debateStructure: "formal",
  numRounds: 3,
  moderator: {
    name: "Rachel Adams",
    voiceId: "en-US-Journey-F",
    style: "neutral",
    openingRemarks: true,
    closingRemarks: true
  },
  sides: [
    {
      sideName: "Safety First",
      speakers: ["Professor Smith"],
      keyPoints: [
        "We must implement rigorous testing protocols before deploying AI systems",
        "AI alignment and value learning need to be solved before scaling capabilities",
        "Historical examples show rushing technology leads to unintended consequences"
      ]
    },
    {
      sideName: "Innovation Priority", 
      speakers: ["Dr. Zhang"],
      keyPoints: [
        "Slowing AI progress cedes ground to less responsible actors",
        "AI can solve urgent challenges in healthcare, climate change, and poverty",
        "Robust AI development processes already exist - we need execution not delay"
      ]
    }
  ],
  bucketName: "smarthome-d6e27.firebasestorage.app",
  transcriptStorage: "transcripts",
  audioStorage: "audio"
}; 
```
> **Note**: For detailed configuration schemas and options for each podcast format, see the TypeScript interfaces in `src/schemas/*.ts`
