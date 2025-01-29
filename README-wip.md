# Open-Source NotebookLM Starter Kit
Build AI-powered content transformation apps—like NotebookLM, but customizable. Powered by [genkit](https://firebase.google.com/docs/genkit)

## What is this?  
NotebookLM Starter Kit is an open-source AI synthesis toolkit that helps developers build NotebookLM-style applications with GenKit. It provides plug-and-play AI pipelines for transforming documents into summaries, podcasts, structured Q&A, and more. 

Comes with a NotebookLM-inspired NextJS webapp, which you can use as a starting point for your next project, or simply as a sample to understand how to use the toolkit effectively.

## Why Use This?  
LLMs are powerful at generating and synthesizing content, however any LLM-powered content generation tool needs a few things:
- Access to input in various formats
- Tools to chunk, store, and retrieve relevant subsets of content
- Workflows that massage LLM output into content digestible by a human

Instead of stitching together RAG, retrieval, and synthesis manually, this toolkit gives you ready-made AI workflows for content transformation.  

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
