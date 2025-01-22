'use server';

import { genkit, z } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import { gemini15Flash } from "@genkit-ai/googleai";

const ai = genkit({
  plugins: [googleAI()],
  model: gemini15Flash,
});

// Move your existing flows here, but remove the Firebase Functions wrapper
export const multiStepPodcastFlow = ai.defineFlow(
  {
    name: "multiStepPodcastFlow",
    inputSchema: z.object({
      pdfPath: z.string()
        .describe("The path to a PDF file")
        .default("example.pdf"),
    }),
    outputSchema: z.object({
      scriptSections: z.array(z.object({
        speaker: z.string(),
        lines: z.array(z.string()),
      })),
    }),
  },
  async (input) => {
    return {
      scriptSections: [
        {
          speaker: "Alex",
          lines: ["The test input was " + input.pdfPath]
        },
        {
          speaker: "Jamie",
          lines: ["I couldn't agree more! Here's what I think..."]
        }
      ]
    };
  }
  // Your existing flow logic here
); 