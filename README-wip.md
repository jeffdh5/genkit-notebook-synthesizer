# Open-Source NotebookLM Starter Kit
Open Source NotebookLM Starter Kit
Build your own NotebookLM-style application with our ready-to-use starter kit.

What’s Included?
- AI-powered synthesis utilities – Convert diverse input sources (links, YouTube videos, text) into structured, consumable formats like podcasts, debates, FAQs, and study guides.
- Serverless backend (Cloud Run) – Deploy a fully functional API in 5 minutes, accessible via HTTP.
- Next.js boilerplate UI – A customizable frontend to help you build your own NotebookLM-inspired experience.

Get started quickly, customize as needed, and bring AI-powered research synthesis to your own applications.

## Key Features  
- Prebuilt AI Pipelines – Summarization, Q&A, podcast scripts, structured reports  
- Multi-Format Outputs – Get text, structured JSON, or AI-generated audio scripts  
- Multi-Agent AI Synthesis – Generate interactive discussions (e.g., AI scientist debates AI journalist)  
- Firebase & Serverless-Friendly – Deploy easily on Firebase, Google Cloud, or run locally  
- Extensible & Customizable – Swap LLMs, tweak synthesis logic, and extend with your own transformations  

## Get Started  

### 1. Install  
```bash
npm install genkit-synthesis-starter
```
### 2. Transform Content 
```bash
import { synthesize } from "genkit-synthesis-starter";

const result = synthesize({
  input: "path/to/article.pdf",
  output: ["summary", "podcast", "Q&A"],
});

console.log(result.summary);  // Key takeaways
console.log(result.podcast);  // AI-generated podcast script
console.log(result.qa);       // AI-generated questions for further exploration
```

### 3. Customize Your Pipelines
```bash
synthesize({
  input: "research_paper.txt",
  format: "debate",
  agents: ["AI Scientist", "AI Journalist"],
});
```

Result: Generates a structured discussion between AI personas debating different perspectives.

## How It Works
- Ingests Content → Supports text, PDFs, and structured notes
- Synthesizes Insights → Converts raw input into summaries, Q&A, debates, or structured reports
- Outputs in Multiple Formats → JSON, markdown, text, audio-friendly scripts
- Powered by GenKit, it runs seamlessly with Firebase AI, Google Cloud, and Gemini models

## Use Cases
- NotebookLM-style AI assistants – Build your own AI-powered knowledge tool
- Automated podcast generators – Convert articles into AI-driven discussions  
- AI research assistants – Extract key insights & generate structured summaries
- AI-powered customer support – Auto-generate responses & FAQs from documentation

## Extending & Customizing
- Use different LLMs – Works with Gemini, OpenAI, or self-hosted models
- Modify synthesis pipelines – Adjust summarization logic, Q&A structure, or output formats
- Deploy anywhere – Firebase, Google Cloud Functions, or self-hosted

## Roadmap & Future Enhancements
- Initial release with summarization, Q&A, podcast generation
- Coming soon: Multi-document synthesis, better agent interactions, Firebase-ready hosting
