import { gemini15Flash } from "@genkit-ai/googleai";
import { ai } from "../config";
import { z } from "genkit";
import * as admin from "firebase-admin";

const discussionHooksInputSchema = z.object({
  summary: z.string(),
  jobId: z.string()
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
    const { jobId, summary } = input;
    const jobRef = admin.firestore().collection('podcastJobs').doc(jobId);
    await jobRef.update({currentStep: 'generating_hooks'});

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
    await jobRef.update({hooksCompleted: true});

    const hooks = hookResponse.text
      .split(/\n/g)
      .map((line) => line.trim())
      .filter(Boolean);

    return { hooks };
  }
);