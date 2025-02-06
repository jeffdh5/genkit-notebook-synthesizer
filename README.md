# Open-Source NotebookLM Starter Kit  

Build your own NotebookLM-style application with our ready-to-use starter kit.

See a hosted demo of a NotebookLM clone, developed using this project: https://webapp--smarthome-d6e27.us-central1.hosted.app/notebooks (click into one of the pre-existing notebooks and click `Generate`)

## What's Included?  
- **AI-powered synthesis utilities** – Convert diverse input sources (**links, YouTube videos, text**) into structured, consumable formats like **podcasts, debates, FAQs, and study guides**. (Available as `npm` package but source code lives here)
- **Serverless backend (Cloud Run)** – Comes with a fully functional API for synthesizing content that you can deploy in **5 minutes**, accessible via HTTP. Uses Firestore and Cloud Tasks to execute the synthesis logic as a background job.
- **Next.js boilerplate UI** – A customizable frontend to help you **build your own NotebookLM-inspired experience**. Easily deployable to both Firebase App Hosting and Vercel.

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
- Want to build AI-powered **research tools, study assistants, or content transformation apps.**  
- Need a **structured AI pipeline** that can synthesize **long-form content into digestible formats (FAQs, podcasts, debates).**  
- Looking for a **Firebase-friendly** solution to deploy quickly.  

✅ **Developers Building AI-Powered Knowledge Tools**  
- Want to **extract insights from documents, links, and transcripts.**  
- Need a **prebuilt synthesis engine** that supports **summarization, Q&A, and structured notes.**  
- Prefer **a modular, extendable AI pipeline** rather than writing everything manually.  

✅ **Researchers & Educators**  
- Need to **generate study guides, structured notes, and educational podcasts** from existing materials.  
- Want a way to **organize and synthesize research papers, transcripts, and other content into useful outputs.**  
- Looking for **an open-source AI-powered NotebookLM alternative** that they can customize.  

✅ **Startups & Companies Experimenting with AI**  
- Want to **quickly prototype AI-powered document processing and knowledge assistants.**  
- Need **a modular system** that allows swapping in **different LLMs and synthesis logic** based on business needs.  
- Prefer a **serverless, Firebase-compatible backend** that scales without DevOps overhead.  

## Prerequisites
Before getting started, you'll need:

1. **Enable Cloud Text-to-Speech API**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Select your project
   - Navigate to "APIs & Services" > "Library" 
   - Search for "Cloud Text-to-Speech API"
   - Click "Enable"

2. **Get a PaLM API Key**
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

1. 
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

## Usage
You can easily 

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