import { z } from "genkit";
import fs from "fs/promises";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import { v4 as uuidv4 } from 'uuid';
import { ai, bucket, tts } from "./config";
import { gemini15Flash } from "@genkit-ai/googleai";
import * as admin from "firebase-admin";

async function uploadFileToStorage(bucket: any, filePath: string, destination: string) {
  await bucket.upload(filePath, {
    destination,
    metadata: {
      cacheControl: 'public, max-age=31536000',
    },
  });
  console.log(`${filePath} uploaded to ${destination}`);
}

// FOR DEMO PURPOSES
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
    const { text } = await ai.generate({
      model: gemini15Flash,
      prompt: `Create a detailed podcast script based on the content of the PDF located at ${input.pdfPath}.`,
    });
    return {
      scriptSections: [
        {
          speaker: "AI",
          lines: [text],
        },
      ],
    };
  }
); 
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

    const structuredSections = summaryResponse.text.split("QUOTES:");
    const summary = structuredSections[0].replace("SUMMARY:", "").trim();
    const quotesAndOutlineRaw = structuredSections[1] || "";
    const quotesBlock = quotesAndOutlineRaw.split("OUTLINE:")[0]?.trim() || "";
    const outlineBlock = quotesAndOutlineRaw.split("OUTLINE:")[1]?.trim() || "";

    return { summary, quotesBlock, outlineBlock };
  }
);

// Flow #2: Discussion Hooks
const discussionHooksInputSchema = z.object({
  summary: z.string(),
  quotesBlock: z.string(),
  outlineBlock: z.string(),
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
  async (inputValues) => {
    const { summary, quotesBlock, outlineBlock } = inputValues;

    const prompt = `
      Given the following summary, quotes, and outline:

      SUMMARY:
      ${summary}

      QUOTES:
      ${quotesBlock}

      OUTLINE:
      ${outlineBlock}

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

// Flow #3: Generate the Podcast Script
const finalPodcastScriptInputSchema = z.object({
  summary: z.string(),
  quotesBlock: z.string(),
  outlineBlock: z.string(),
  hooks: z.array(z.string()),
});

const finalPodcastScriptOutputSchema = z.object({
  scriptSections: z.array(
    z.object({
      speaker: z.enum(["Alex", "Jamie"]),
      lines: z.array(z.string()),
    })
  ),
});

export const finalPodcastScriptFlow = ai.defineFlow(
  {
    name: "finalPodcastScriptFlow",
    inputSchema: finalPodcastScriptInputSchema,
    outputSchema: finalPodcastScriptOutputSchema,
  },
  async (inputValues) => {
    const { summary, quotesBlock, outlineBlock, hooks } = inputValues;

    const prompt = `
      We have a summary, quotes, an outline, and these hooks:
      ${hooks.join("\n")}

      Create a podcast script for Alex and Jamie that:
      - Uses at least two direct quotes.
      - Explains data/points.
      - Includes some debate/disagreement.
      - Has lighthearted/comedic lines.
      - Returns valid JSON array (speaker + lines).

      SUMMARY:
      ${summary}

      QUOTES:
      ${quotesBlock}

      OUTLINE:
      ${outlineBlock}
    `;

    const scriptResponse = await ai.generate({
      model: gemini15Flash,
      prompt,
      config: { temperature: 0.8 },
      output: { schema: finalPodcastScriptOutputSchema },
    });

    const scriptSections = scriptResponse.output?.scriptSections || [];
    return { scriptSections };
  }
);

// Flow #4: Synthesize Audio
const synthesizeAudioInputSchema = z.object({
  scriptSections: z.array(
    z.object({
      speaker: z.string(),
      lines: z.array(z.string()),
    })
  ),
});

const synthesizeAudioOutputSchema = z.object({
  audioFileName: z.string(),
  storageUrl: z.string(),
});

export const synthesizeAudioFlow = ai.defineFlow(
  {
    name: "synthesizeAudioFlow",
    inputSchema: synthesizeAudioInputSchema,
    outputSchema: synthesizeAudioOutputSchema,
  },
  async (inputValues) => {
    const { scriptSections } = inputValues;
    const outputFileName = `podcast_audio_${Date.now()}.mp3`;
    const storageUrl = await synthesizePodcastAudio(scriptSections, bucket, outputFileName);
    return { audioFileName: outputFileName, storageUrl };
  }
);

// Optional: End-to-end Flow
const endToEndPodcastInputSchema = z.object({
  sourceText: z.string(),
  jobId: z.string(),
});

const endToEndPodcastOutputSchema = z.object({
  audioFileName: z.string(),
  scriptSections: z.array(
    z.object({
      speaker: z.enum(["Alex", "Jamie"]),
      lines: z.array(z.string()),
    })
  ),
  storageUrl: z.string(),
});

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

export const endToEndPodcastFlow = ai.defineFlow(
  {
    name: "endToEndPodcastFlow",
    inputSchema: endToEndPodcastInputSchema,
    outputSchema: endToEndPodcastOutputSchema,
  },
  async (input) => {
    let timer = Date.now();
    const metrics: Record<string, number> = {};
    const jobRef = admin.firestore().collection('podcastJobs').doc(input.jobId);

    // Update initial status
    const initialUpdate: Partial<PodcastJobDocument> = {
      status: 'PROCESSING',
      currentStep: 'summarizing',
      summarizeCompleted: false,
      hooksCompleted: false,
      scriptCompleted: false,
      audioCompleted: false,
    };
    await jobRef.update(initialUpdate);

    try {
      // Step 1: Summarize
      const summaryResult = await summarizeSourceFlow({ sourceText: input.sourceText });
      metrics.summarize = Date.now() - timer;
      await jobRef.update({ 
        summarizeCompleted: true,
        summaryOutput: summaryResult,
        currentStep: 'generating_hooks'
      });
      timer = Date.now();

      // Step 2: Generate hooks
      const hooksResult = await discussionHooksFlow(summaryResult);
      metrics.hooks = Date.now() - timer;
      await jobRef.update({ 
        hooksCompleted: true,
        hooksOutput: hooksResult,
        currentStep: 'generating_script'
      });
      timer = Date.now();

      // Step 3: Generate script
      const scriptResult = await finalPodcastScriptFlow({ 
        ...summaryResult, 
        ...hooksResult 
      });
      metrics.script = Date.now() - timer;
      await jobRef.update({ 
        scriptCompleted: true,
        scriptOutput: scriptResult,
        currentStep: 'synthesizing_audio'
      });
      timer = Date.now();

      // Step 4: Synthesize audio
      const audioResult = await synthesizeAudioFlow(scriptResult);
      metrics.audio = Date.now() - timer;
      await jobRef.update({ 
        audioCompleted: true,
        audioOutput: audioResult
      });

      // Update final success state
      await jobRef.update({
        status: 'COMPLETED',
        //currentStep: admin.firestore.FieldValue.delete(),
        currentStep: '', // todo use admin delete field
        metrics,
      });

      return { 
        audioFileName: audioResult.audioFileName, 
        scriptSections: scriptResult.scriptSections, 
        storageUrl: audioResult.storageUrl 
      };
    } catch (error) {
      // Update error state
      await jobRef.update({
        status: 'ERROR',
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
);

type PodcastScriptSection = {
  speaker: string;
  lines: string[];
}

enum AudioEncoding {
  MP3 = "MP3",
  AUDIO_ENCODING_UNSPECIFIED = "AUDIO_ENCODING_UNSPECIFIED",
  LINEAR16 = "LINEAR16",
  OGG_OPUS = "OGG_OPUS",
  MULAW = "MULAW",
  ALAW = "ALAW",
  PCM = "PCM",
}



/**
 * This function loops through each line of the final podcast script,
 * synthesizes the audio for each line, and writes out separate mp3 segments.
 * Finally, it merges all segments into a single mp3 file named "finalPodcast.mp3".
 */
export async function synthesizePodcastAudio(
  scriptSections: PodcastScriptSection[],
  bucket: any,
  outputFileName = "",
) {
  console.log('Starting audio synthesis for', scriptSections.length, 'sections');
  const segmentFiles: string[] = [];
  const concurrency = 3;
  const startTime = Date.now();
  const synthesisMetrics = {
    totalSegments: 0,
    avgSegmentTime: 0,
    mergeTime: 0,
    uploadTime: 0,
    retries: 0,
  };

  // Add line count metrics
  const totalLines = scriptSections.reduce((acc, sec) => acc + sec.lines.length, 0);
  synthesisMetrics.totalSegments = totalLines;
  console.log(`Total lines to synthesize: ${totalLines}`);

  // Add retry helper function
  const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        console.log(`Retrying... attempts left: ${retries}`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        return withRetry(fn, retries - 1, delayMs * 2); // Exponential backoff
      }
      throw error;
    }
  };

  try {
    // Process sections in parallel with limited concurrency
    const batchPromises = [];
    const allSegments = scriptSections.flatMap((section, sectionIndex) => 
      section.lines.map((line, lineIndex) => ({
        section, line, segmentIndex: sectionIndex * 1000 + lineIndex
      }))
    );

    while (allSegments.length > 0) {
      const batch = allSegments.splice(0, concurrency);
      batchPromises.push(
        Promise.all(batch.map(async ({ section, line, segmentIndex }) => {
          const segmentStart = Date.now();
          const segmentFileName = `segment_${segmentIndex}_${section.speaker}.mp3`;
          
          // Wrap API call with retry
          await withRetry(async () => {
            console.log(`Synthesizing audio for segment ${segmentIndex}`);
            const [response] = await tts.synthesizeSpeech({
              input: { text: line },
              voice: {
                languageCode: "en-US",
                name: section.speaker === "Alex" ? "en-US-Journey-D" : "en-US-Journey-F",
              },
              audioConfig: {
                audioEncoding: AudioEncoding.MP3,
                effectsProfileId: ["small-bluetooth-speaker-class-device"],
                pitch: 0,
                speakingRate: 1,
              },
            });
            
            if (!response.audioContent) {
              throw new Error("No audio content received");
            }
            
            await fs.writeFile(segmentFileName, response.audioContent, "binary");
          });

          const segmentTime = Date.now() - segmentStart;
          synthesisMetrics.avgSegmentTime = (synthesisMetrics.avgSegmentTime * (segmentIndex) + segmentTime) / (segmentIndex + 1);
          return segmentFileName;
        }))
      );

      // Add delay between batches
      if (allSegments.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      }
    }

    const segmentFiles = (await Promise.all(batchPromises)).flat();

    console.log('Merging', segmentFiles.length, 'audio segments...');
    const mergeStart = Date.now();
    await mergeAudioFiles(segmentFiles, outputFileName);
    synthesisMetrics.mergeTime = Date.now() - mergeStart;
    
    console.log('Uploading merged file to storage...');
    const uploadStart = Date.now();
    const finalOutputFileName = outputFileName || `${uuidv4()}.mp3`;
    const uniqueFileName = `podcasts/${finalOutputFileName}`;
    await uploadFileToStorage(bucket, finalOutputFileName, uniqueFileName);
    synthesisMetrics.uploadTime = Date.now() - uploadStart;

    console.log('Generating shareable download URL...');
    const gsUrl = `gs://${process.env.FB_ADMIN_STORAGE_BUCKET}/${uniqueFileName}`;
    console.log('Generated Google Storage URL:', gsUrl);

    console.log('Cleaning up temporary files...');
    await Promise.all(
      segmentFiles.map(file => 
        fs.unlink(file).catch(err => 
          console.warn("Could not remove temp file:", file, err)
        )
      )
    );
    await fs.unlink(outputFileName).catch(err => 
      console.warn("Could not remove merged file:", outputFileName, err)
    );
    console.log('Cleanup complete');

    // Add audio synthesis metrics
    console.log('\n=== Audio Synthesis Metrics ===');
    console.log(`Total segments processed: ${synthesisMetrics.totalSegments}`);
    console.log(`Average segment time: ${synthesisMetrics.avgSegmentTime.toFixed(1)}ms`);
    console.log(`Merge time: ${synthesisMetrics.mergeTime}ms`);
    console.log(`Upload time: ${synthesisMetrics.uploadTime}ms`);
    console.log(`Retry attempts: ${synthesisMetrics.retries}`);
    console.log(`Total audio processing time: ${Date.now() - startTime}ms\n`);

    return gsUrl;
  } catch (error) {
    console.error('Error during audio synthesis:', error);
    // Clean up any temporary files if something went wrong
    await Promise.all(
      segmentFiles.map(file => 
        fs.unlink(file).catch(() => {/* ignore cleanup errors */})
      )
    );
    throw error;
  }
}

// Helper function to promisify ffmpeg merge operation
async function mergeAudioFiles(segmentFiles: string[], outputFileName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    let command = ffmpeg();
    
    segmentFiles.forEach(file => command.input(file));

    command
      .on('error', (err) => reject(err))
      .on('end', () => resolve())
      .mergeToFile(path.join(process.cwd(), outputFileName), path.join(process.cwd(), 'tmp'));
  });
}