import * as logger from "firebase-functions/logger";
import { onCall } from "firebase-functions/v2/https";
import { onTaskDispatched } from "firebase-functions/v2/tasks";
import { getFunctions } from "firebase-admin/functions";
import { endToEndPodcastFlow } from "./flows";
import { db, JOBS_COLLECTION } from "./config";
import { JobStatus, PodcastOptions, SynthesisRequest } from "./schemas/podcast";
import { synthesize } from "./synthesis";
import { getFunctionUrl } from "./util";


// Function to handle the initial request and enqueue the task
export const generatePodcast = onCall(async (request) => {
  const sourceText = request.data.sourceText;
  if (!sourceText) { throw new Error("Source text is required") }
  logger.info("Enqueueing podcast generation task");

  try {
    const jobRef = db.collection(JOBS_COLLECTION).doc();
    await jobRef.set({
      sourceText,
      status: JobStatus.PROCESSING,
    });
    const queue = getFunctions().taskQueue("processPodcastGeneration");
    const targetUri = await getFunctionUrl("processPodcastGeneration");
    await queue.enqueue(
      { sourceText, jobId: jobRef.id },
      {
        dispatchDeadlineSeconds: 60 * 30, // 30 minute deadline
        uri: targetUri,
      }
    );
    return { 
      jobId: jobRef.id,
      status: JobStatus.QUEUED, 
      message: "Podcast generation has been queued" 
    };
  } catch (error) {
    logger.error("Error enqueueing podcast generation task", error);
    throw new Error(`Failed to start podcast generation: ${error instanceof Error ? error.message : String(error)}`);
  }
});

// Function to process the actual podcast generation
export const processPodcastGeneration = onTaskDispatched(
  {
    retryConfig: {
      maxAttempts: 3,
      minBackoffSeconds: 60,
    },
    rateLimits: {
      maxConcurrentDispatches: 5,
    },
  },
  async (req: { data: { sourceTexts: string[], jobId: string, options: PodcastOptions } }) => {
    const sourceTexts = req.data.sourceTexts;
    const jobId = req.data.jobId;
    const options = req.data.options;
    logger.info("Processing podcast generation task");
    try {
      if (options.format === "roundtable") {
        const result = await endToEndPodcastFlow({ jobId, sourceTexts, options });
        logger.info("Podcast generation completed successfully", { result });
      } else {
        throw("Podcast option not supported.");
      }
    } catch (error) {
      logger.error("Error generating podcast", { error });
      throw error;
    }
  }
);

// Function to trigger synthesis task
export const triggerSynthesis = onCall(async (request) => {
  try {
    const jobRef = db.collection(JOBS_COLLECTION).doc();
    await jobRef.set({
      status: JobStatus.QUEUED,
      request: request.data
    });

    const queue = getFunctions().taskQueue("processSynthesis");
    const targetUri = await getFunctionUrl("processSynthesis");
    
    await queue.enqueue(
      { 
        jobId: jobRef.id,
        request: request.data
      },
      {
        dispatchDeadlineSeconds: 60 * 30, // 30 minute deadline
        uri: targetUri,
      }
    );

    return {
      jobId: jobRef.id,
      status: JobStatus.QUEUED,
      message: "Synthesis has been queued"
    };

  } catch (error) {
    logger.error("Error enqueueing synthesis task", error);
    throw new Error(`Failed to start synthesis: ${error instanceof Error ? error.message : String(error)}`);
  }
});

// Function to process the actual synthesis
export const processSynthesis = onTaskDispatched(
  {
    retryConfig: {
      maxAttempts: 3,
      minBackoffSeconds: 60,
    },
    rateLimits: {
      maxConcurrentDispatches: 5,
    },
  },
  async (req: { data: { jobId: string, request: SynthesisRequest } }) => {
    const { jobId, request } = req.data;
    logger.info("Processing synthesis task");

    try {
      const jobRef = db.collection(JOBS_COLLECTION).doc(jobId);
      await jobRef.update({ status: JobStatus.PROCESSING });

      const result = await synthesize(request);
      
      await jobRef.update({
        status: JobStatus.COMPLETED,
        result,
      });

      logger.info("Synthesis completed successfully", { jobId });
    } catch (error) {
      logger.error("Error during synthesis", { error, jobId });
      await db.collection(JOBS_COLLECTION).doc(jobId).update({
        status: JobStatus.ERROR,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
);

