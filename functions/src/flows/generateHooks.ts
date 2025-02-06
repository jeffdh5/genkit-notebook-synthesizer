import { gemini15Flash } from "@genkit-ai/googleai";
import { ai } from "../config";
import { z } from "genkit";

const discussionHooksInputSchema = z.object({
  summary: z.string()
});

const discussionHooksOutputSchema = z.object({
  hooks: z.array(z.string()),
});

export const discussionHooksFlow = ai.defineFlow(
  {
    name: "discussionHooksFlow", 
    inputSchema: discussionHooksInputSchema,
    outputSchema: discussionHooksOutputSchema,
  },
  async (input) => {
    const { summary } = input;

    const prompt = `
      Given the following summaries:
      ${summary}

      Suggest 5-7 angles or hooks for a podcast conversation.
      Each one should be a short bullet introducing a question or point.
    `;

    const hookResponse = await ai.generate({
      model: gemini15Flash,
      prompt,
      config: { temperature: 0.7 },
      output: { schema: discussionHooksOutputSchema },
    });

    const hooks = hookResponse.text
      .split(/\n/g)
      .map((line) => line.trim())
      .filter(Boolean);

    return { hooks };
  }
);