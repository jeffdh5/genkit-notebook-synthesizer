# Open-Source NotebookLM Starter Kit  

Build your own NotebookLM-style application with our ready-to-use starter kit.

See a hosted demo of a NotebookLM clone, developed using this project: https://webapp--smarthome-d6e27.us-central1.hosted.app/notebooks (click into one of the pre-existing notebooks and click `Generate`)

## What’s Included?  
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

## Get Started (to be updated - see types.ts for latest real configuration)

### 1. Install  
```sh
npm install genkit-synthesis-starter
```

### **2. Interview Podcast **
```typescript
synthesize({
  input: "ai_healthcare_research.txt",
  output: "podcast",
  options: {
    format: "interview",
    speakers: [
      { name: "John Doe", role: "host", gender: "male" },
      { name: "Dr. Emily Carter", role: "guest", gender: "female" }
    ],
    duration: 30,
    intervieweeName: "Dr. Emily Carter",
    topic: "The Future of AI in Healthcare",
    interviewStyle: "scripted",
    maxQuestions: 10
  }
});
```

### **3. Roundtable Podcast **

```typescript
synthesize({
  input: "crypto_market_analysis.txt",
  output: "podcast",
  options: {
    format: "roundtable",
    speakers: [
      { name: "Lisa Tran", role: "moderator", gender: "female" },
      { name: "David Kim", role: "expert", gender: "male" },
      { name: "Sophia Lee", role: "expert", gender: "female" }
    ],
    duration: 45,
    discussionStyle: "expert_panel",
    structure: "moderated_topics",
    includeModerator: true,
    maxSpeakerTime: 5
  }
});
```

### **4. Formal Debate with Moderator **
```
synthesize({
  input: "ai_ethics_whitepaper.txt",
  output: "podcast",
  options: {
    format: "debate",
    speakers: [
      { name: "Alice Johnson", role: "panelist", gender: "female" },
      { name: "Mark Davis", role: "panelist", gender: "male" }
    ],
    duration: 40,
    debateTopic: "Should AI Be Regulated?",
    debateStructure: "formal",
    numRounds: 3,
    autoAssignSides: false,
    sides: [
      { sideName: "Pro AI Regulation", speakers: ["Alice Johnson"], keyPoints: ["Ethical concerns", "Bias risks"] },
      { sideName: "Against AI Regulation", speakers: ["Mark Davis"], keyPoints: ["Innovation freedom", "Economic growth"] }
    ],
    moderator: { name: "James Smith", gender: "male", style: "neutral", openingRemarks: true }
  }
});
```

### **5. Trend Analysis Podcast (Casual roundtable) **
```
synthesize({
  input: "tech_trends_2025.txt",
  output: "podcast",
  options: {
    format: "roundtable",
    speakers: [
      { name: "Ethan Patel", role: "host", gender: "male" },
      { name: "Mia Sanchez", role: "guest", gender: "female" }
    ],
    duration: 20,
    discussionStyle: "trend_analysis",
    structure: "open_discussion",
    includeModerator: false,
    maxSpeakerTime: 7
  }
});
```
