# Open-Source NotebookLM Starter Kit  

Build your own NotebookLM-style application with our ready-to-use starter kit.  

## What’s Included?  
- **AI-powered synthesis utilities** – Convert diverse input sources (**links, YouTube videos, text**) into structured, consumable formats like **podcasts, debates, FAQs, and study guides**.  
- **Serverless backend (Cloud Run)** – Deploy a fully functional API in **5 minutes**, accessible via HTTP.  
- **Next.js boilerplate UI** – A customizable frontend to help you **build your own NotebookLM-inspired experience**.  

Get started quickly, customize as needed, and bring AI-powered research synthesis to your own applications.  

## Key Features  
- **Prebuilt AI Pipelines** – Summarization, Q&A, podcast scripts, structured reports  
- **Multi-Format Outputs** – Synthesize your raw input sources into podcasts, debates, FAQs, and more note formats  
- **Multi-Agent AI Synthesis** – Generate interactive discussions that highlight disparate viewpoints (e.g., AI scientist debates AI journalist)  
- **Firebase & Serverless-Friendly** – Deploy easily on Firebase, Google Cloud, or run locally  
- **Extensible & Customizable** – Swap LLMs, tweak synthesis logic, and extend with your own transformations  

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


