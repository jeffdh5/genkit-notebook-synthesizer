import * as logger from "firebase-functions/logger";
import { onCall } from "firebase-functions/v2/https";
import { endToEndPodcastFlow } from "./flows";

export const generatePodcast = onCall(async (request) => {
  const sourceText = request.data.sourceText;
  logger.info("Executing endToEndPodcastFlow", { structuredData: true });

  try {
    const result = await endToEndPodcastFlow({sourceText});
    logger.info("endToEndPodcastFlow executed successfully", { result });
    return result;
  } catch (error) {
    logger.error("Error executing endToEndPodcastFlow", { error });
    throw new Error("Failed to execute endToEndPodcastFlow");
  }
});
