# Open-Source NotebookLM Starter Kit  

Build your own NotebookLM-style application with our ready-to-use starter kit.

See a hosted demo of a NotebookLM clone, developed using this project: https://webapp--smarthome-d6e27.us-central1.hosted.app/

## What’s Included?  
- **AI-powered synthesis utilities** – Convert diverse input sources (**links, YouTube videos, text**) into structured, consumable formats like **podcasts, debates, FAQs, and study guides**.  
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

## Get Started  

### 1. Install  
```sh
npm install genkit-synthesis-starter
```

### 2. Transform Content
```ts
import { synthesize } from "genkit-synthesis-starter";

const result = synthesize({
  input: "path/to/article.pdf",
  output: ["summary", "podcast", "Q&A"],
});

console.log(result.summary);  // Key takeaways
console.log(result.podcast);  // AI-generated podcast script
console.log(result.qa);       // AI-generated questions for further exploration
```
### 3. Customize Pipelines
```ts
synthesize({
  input: "research_paper.txt",
  output: "debate",
  options: {
    agents: ["AI Scientist", "AI Journalist"]
  }
});
```
This generates a structured discussion between AI personas debating different perspectives.


