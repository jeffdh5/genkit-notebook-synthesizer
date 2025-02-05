import { z } from "genkit";
import { ai } from "./config";
//import * as admin from "firebase-admin";
import { podcastOptionsSchema } from "./types";
import { roundtablePodcastScriptFlow } from "./flows/formats/roundtable";
import { summarizeSourceFlow } from "./flows/summarizeSource";
import { synthesizeAudioFlow } from "./flows/synthesizeAudio";
import { discussionHooksFlow } from "./flows/generateHooks";

// Flow #2: Discussion Hooks

const endToEndPodcastInputSchema = z.object({
  sourceTexts: z.array(z.string()),
  jobId: z.string(),
  options: podcastOptionsSchema,
});

const endToEndPodcastOutputSchema = z.object({
  audioFileName: z.string(),
  script: z.array(
    z.object({
      speaker: z.string(),
      text: z.string(),
    })
  ),
  storageUrl: z.string(),
});

/*
type StepStatus = 'summarizing' | 'generating_hooks' | 'generating_script' | 'synthesizing_audio' | 'completed';
type JobStatus = 'PROCESSING' | 'COMPLETED' | 'ERROR';


interface PodcastJobDocument {
  status: JobStatus;
  currentStep: StepStatus;
  summarizeCompleted: boolean;
  hooksCompleted: boolean;
  scriptCompleted: boolean;
  audioCompleted: boolean;
  summaryOutput?: {
    summary: string;
    quotesBlock: string;
    outlineBlock: string;
  };
  hooksOutput?: {
    hooks: string[];
  };
  scriptOutput?: {
    scriptSections: Array<{
      speaker: "Alex" | "Jamie";
      lines: string[];
    }>;
  };
  audioOutput?: {
    audioFileName: string;
    storageUrl: string;
  };
  metrics?: Record<string, number>;
  error?: string;
  completedAt?: admin.firestore.Timestamp;
}
*/

export const endToEndPodcastFlow = ai.defineFlow(
  {
    name: "endToEndPodcastFlow",
    inputSchema: endToEndPodcastInputSchema,
    outputSchema: endToEndPodcastOutputSchema,
  },
  async (input) => {
    let timer = Date.now();
    const metrics: Record<string, number> = {};

    try {
      // Step 1: Summarize each source independently
      const summaryResults = await Promise.all(
        input.sourceTexts.map(sourceText => 
          summarizeSourceFlow({ sourceText })
        )
      );
      
      // Combine the summaries
      const combinedSummary = "------ BEGIN INPUT SOURCE SUMMARIES ------\n" +
          summaryResults.map((r, i) => 
            `SOURCE #${i + 1}:\nSummary: ${r.summary}\nQuotes: ${r.quotesBlock}`
          ).join("\n------------\n") +
          "\n------ END INPUT SOURCE SUMMARIES -----";

      metrics.summarize = Date.now() - timer;
      timer = Date.now();

      // Step 2: Generate hooks
      const hooksResult = await discussionHooksFlow({summary: combinedSummary, jobId: input.jobId});
      metrics.hooks = Date.now() - timer;
      timer = Date.now();

      // Step 3: Generate script
      let scriptResult;
      if (input.options.format === "roundtable") {
        scriptResult = await roundtablePodcastScriptFlow({ 
          summary: combinedSummary, 
          options: input.options,
          hooks: hooksResult.hooks,
          jobId: input.jobId
        });
      } else {
        throw new Error("Only roundtable format is currently supported");
      }
      metrics.script = Date.now() - timer;
      timer = Date.now();

      // Step 4: Synthesize audio
      const audioResult = await synthesizeAudioFlow({
        script: scriptResult.script,
        speakers: input.options.speakers,
        moderator: input.options.moderator,
        options: input.options
      });
      metrics.audio = Date.now() - timer;

      return { 
        audioFileName: audioResult.audioFileName, 
        script: scriptResult.script, 
        storageUrl: audioResult.storageUrl 
      };
    } catch (error) {
      throw error;
    }
  }
);
