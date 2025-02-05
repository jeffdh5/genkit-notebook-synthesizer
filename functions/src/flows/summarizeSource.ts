import { z } from "genkit";
import { ai } from "../config";
import { gemini15Flash } from "@genkit-ai/googleai";

// Flow #1: Summarize Source
const summarizeSourceInputSchema = z.object({
    sourceText: z.string(),
  });
  
  const summarizeSourceOutputSchema = z.object({
    summary: z.string(),
    quotesBlock: z.string(),
    outlineBlock: z.string(),
  });
  
  export const summarizeSourceFlow = ai.defineFlow(
    {
      name: "summarizeSourceFlow",
      inputSchema: summarizeSourceInputSchema,
      outputSchema: summarizeSourceOutputSchema,
    },
    async (inputValues) => {
      const { sourceText } = inputValues;
  
      const prompt = `
        You have a piece of text.
        1) Summarize it (2-3 paragraphs).
        2) Provide a short list of direct quotes or excerpts.
        3) Give a bullet-list outline of the key points.
  
        Source:
        ${sourceText}
      `;
  
      const summaryResponse = await ai.generate({
        model: gemini15Flash,
        prompt,
        config: { temperature: 0.8 },
        output: { schema: summarizeSourceOutputSchema },
      });
  
      const summary = summaryResponse.output?.summary || "";
      const quotesBlock = summaryResponse.output?.quotesBlock || "";
      const outlineBlock = summaryResponse.output?.outlineBlock || "";
  
      return { summary, quotesBlock, outlineBlock };
    }
  );