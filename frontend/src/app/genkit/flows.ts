'use server';

import { genkit, z } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import { gemini15Flash } from "@genkit-ai/googleai";
import textToSpeech from "@google-cloud/text-to-speech";
import fs from "fs/promises";
import ffmpeg from "fluent-ffmpeg";
import path from "path";

const ai = genkit({
  plugins: [googleAI()],
  model: gemini15Flash,
});

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
    await synthesizePodcastAudio(scriptSections, outputFileName);
    return { audioFileName: outputFileName };
  }
);

// Optional: End-to-end Flow
const endToEndPodcastInputSchema = z.object({
  sourceText: z.string(),
});

const endToEndPodcastOutputSchema = z.object({
  audioFileName: z.string(),
  scriptSections: z.array(
    z.object({
      speaker: z.enum(["Alex", "Jamie"]),
      lines: z.array(z.string()),
    })
  ),
});

export const endToEndPodcastFlow = ai.defineFlow(
  {
    name: "endToEndPodcastFlow",
    inputSchema: endToEndPodcastInputSchema,
    outputSchema: endToEndPodcastOutputSchema,
  },
  async (input) => {
    const { summary, quotesBlock, outlineBlock } = 
      await summarizeSourceFlow(input);

    const { hooks } = 
      await discussionHooksFlow({ summary, quotesBlock, outlineBlock });

    const { scriptSections } = 
      await finalPodcastScriptFlow({ summary, quotesBlock, outlineBlock, hooks });

    const { audioFileName } = 
      await synthesizeAudioFlow({ scriptSections });

    return { audioFileName, scriptSections };
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
  outputFileName = "finalPodcast.mp3"
) {
  console.log('Starting audio synthesis for', scriptSections.length, 'sections');
  const client = new textToSpeech.TextToSpeechClient();
  const segmentFiles: string[] = [];
  let segmentIndex = 0;

  try {
    // Generate individual MP3 segments
    for (const section of scriptSections) {
      console.log(`Processing section for speaker: ${section.speaker}, lines: ${section.lines.length}`);
      for (const line of section.lines) {
        console.log(`Synthesizing audio for segment ${segmentIndex}`);
        const request = {
          input: { text: line },
          voice: {
            languageCode: "en-US",
            name: section.speaker === "Alex" ? "en-US-Journey-D" : "en-US-Journey-F",
          },
          audioConfig: {
            audioEncoding: AudioEncoding.LINEAR16,
            effectsProfileId: ["small-bluetooth-speaker-class-device"],
            pitch: 0,
            speakingRate: 1,
          },
        };
        
        const [response] = await client.synthesizeSpeech(request);
        
        if (!response.audioContent) {
          throw new Error("No audio content received from Text-to-Speech API");
        }
        
        const segmentFileName = `segment_${segmentIndex}_${section.speaker}.mp3`;
        console.log(`Writing audio content to file: ${segmentFileName}`);
        await fs.writeFile(segmentFileName, response.audioContent, "binary");
        console.log(`Successfully wrote audio content to file: ${segmentFileName}`);
        segmentFiles.push(segmentFileName);
        segmentIndex++;
      }
    }

    console.log('Merging', segmentFiles.length, 'audio segments...');
    await mergeAudioFiles(segmentFiles, outputFileName);
    console.log('Successfully merged audio files');

    console.log('Cleaning up temporary files...');
    await Promise.all(
      segmentFiles.map(file => 
        fs.unlink(file).catch(err => 
          console.warn("Could not remove temp file:", file, err)
        )
      )
    );
    console.log('Cleanup complete');

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