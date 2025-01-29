import * as logger from "firebase-functions/logger";
import { onCall } from "firebase-functions/v2/https";
import { onTaskDispatched } from "firebase-functions/v2/tasks";
import { getFunctions } from "firebase-admin/functions";
import { endToEndPodcastFlow } from "./flows";
import { GoogleAuth } from "google-auth-library";
import { db } from "./config";

const IS_EMULATOR = false;  // Toggle this for local development

// Helper function to get the function URL
async function getFunctionUrl(name: string, location = "us-central1") {
  if (IS_EMULATOR) {
    return `http://127.0.0.1:5001/smarthome-d6e27/${location}/${name}`;
  }

  const auth = new GoogleAuth({
    scopes: "https://www.googleapis.com/auth/cloud-platform",
  });
  const projectId = await auth.getProjectId();
  const url = `https://cloudfunctions.googleapis.com/v2beta/projects/${projectId}/locations/${location}/functions/${name}`;

  const client = await auth.getClient();
  interface FunctionResponse {
    serviceConfig: { uri: string }
  }
  const res = await client.request<FunctionResponse>({ url });
  const uri = res.data?.serviceConfig?.uri;
  if (!uri) {
    throw new Error(`Unable to retrieve uri for function at ${url}`);
  }
  return uri;
}

// Function to handle the initial request and enqueue the task
export const generatePodcast = onCall(async (request) => {
  const sourceText = request.data.sourceText;
  
  if (!sourceText) {
    throw new Error("Source text is required");
  }
  
  logger.info("Enqueueing podcast generation task");

  try {
    // Use db instead of admin.firestore()
    const jobRef = db.collection('podcastJobs').doc();
    await jobRef.set({
      sourceText,
      status: 'QUEUED',
    });
    logger.info("000")

    const queue = getFunctions().taskQueue("processPodcastGeneration");
    logger.info("111")
    const targetUri = await getFunctionUrl("processPodcastGeneration");
    logger.info("Task to enqueue", { jobId: jobRef.id, targetUri });
    await queue.enqueue(
      { sourceText, jobId: jobRef.id },
      {
        dispatchDeadlineSeconds: 60 * 30, // 30 minute deadline
        uri: targetUri,
      }
    );

    return { 
      jobId: jobRef.id,
      status: "queued", 
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
  async (req) => {
    const sourceText = req.data.sourceText;
    const jobId = req.data.jobId;
    logger.info("Processing podcast generation task", { structuredData: true });

    try {
      const result = await endToEndPodcastFlow({ jobId, sourceText });
      logger.info("Podcast generation completed successfully", { result });
    } catch (error) {
      logger.error("Error generating podcast", { error });
      throw error;
    }
  }
);
