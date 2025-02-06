import { z } from "genkit";
import { ai, db, JOBS_COLLECTION } from "./config";
import { JobStatus, podcastOptionsSchema } from "./schemas/podcast";
import { summarizeSourcesFlow } from "./flows/summarizeSource";
import { synthesizeAudioFlow } from "./flows/synthesizeAudio";
import { discussionHooksFlow } from "./flows/generateHooks";
import { generateScriptFlow } from "./flows/generateScript";

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

export const endToEndPodcastFlow = ai.defineFlow(
  {
    name: "endToEndPodcastFlow", 
    inputSchema: endToEndPodcastInputSchema,
    outputSchema: endToEndPodcastOutputSchema,
  },
  async (input) => {
    let timer = Date.now();
    const metrics: Record<string, number> = {};
    const jobRef = db.collection(JOBS_COLLECTION).doc(input.jobId);
    await jobRef.set({
      status: JobStatus.QUEUED,
      jobId: input.jobId,
      createdAt: Date.now()
    }, { merge: true });

    try {
      await jobRef.update({
        status: JobStatus.PROCESSING,
        currentStep: 'Generating summary',
        startTime: Date.now()
      });

      const summaryResult = await summarizeSourcesFlow({
        sourceTexts: input.sourceTexts,
      });
      metrics.summarize = Date.now() - timer;
      timer = Date.now();

      await jobRef.update({
        currentStep: 'Generating discussion hooks'
      });

      const hooksResult = await discussionHooksFlow({
        summary: summaryResult.combinedSummary, 
      });
      metrics.hooks = Date.now() - timer;
      timer = Date.now();

      await jobRef.update({
        currentStep: 'Generating script'
      });

      const scriptResult = await generateScriptFlow({
        summary: summaryResult.combinedSummary,
        hooks: hooksResult.hooks,
        options: input.options,
      });
      metrics.script = Date.now() - timer;
      timer = Date.now();

      await jobRef.update({
        currentStep: 'Synthesizing audio'
      });

      const audioResult = await synthesizeAudioFlow({
        script: scriptResult.script,
        speakers: input.options.speakers,
        moderator: 'moderator' in input.options ? input.options.moderator : undefined,
        options: input.options,
      });
      metrics.audio = Date.now() - timer;

      await jobRef.update({
        status: JobStatus.COMPLETED,
        currentStep: '',
        metrics,
        completedAt: Date.now(),
        summary: summaryResult.combinedSummary,
        hooks: hooksResult.hooks,
        script: scriptResult.script,
        audioUrl: audioResult.storageUrl
      });

      return {
        audioFileName: audioResult.audioFileName,
        script: scriptResult.script,
        storageUrl: audioResult.storageUrl
      };
    } catch (error) {
      await jobRef.update({
        status: JobStatus.ERROR,
        error: error instanceof Error ? error.message : String(error),
        failedAt: Date.now()
      });
      throw error;
    }
  }
);
