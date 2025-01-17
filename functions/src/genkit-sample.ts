// Import the Genkit core libraries and plugins.
import {genkit, z} from "genkit";
import {googleAI} from "@genkit-ai/googleai";
import fs from "fs/promises";
import path from "path";
import pdfParse from "pdf-parse";
import textToSpeech from "@google-cloud/text-to-speech";

import ffmpeg from "fluent-ffmpeg";

// Import models from the Google AI plugin. The Google AI API provides access to
// several generative models. Here, we import Gemini 1.5 Flash.
import {gemini15Flash} from "@genkit-ai/googleai";

// From the Firebase plugin, import the functions needed to deploy flows using
// Cloud Functions.
import {firebaseAuth} from "@genkit-ai/firebase/auth";
import {onFlow} from "@genkit-ai/firebase/functions";

/**
 * This multi-step flow takes the contents of an academic PDF and progressively
 * refines it into an engaging podcast script with structured output.
 * 
 * High-level approach:
 * 1. Summarize the PDF (less formal, more approachable).
 * 2. Extract key points or subtopics you want to highlight (like main takeaways).
 * 3. Generate some possible conversation hooks or banter elements.
 * 4. Produce a final script structure (array of objects with speaker lines).
 * 5. Return structured output consistent with a typed schema.
 */

/**
 * Input is now the relative PDF filepath (relative to src/).
 */
const InputSchema = z.object({
  pdfPath: z.string()
    .describe("The path to a PDF file, relative to the src/ folder")
    .default("example.pdf"),
});

/**
 * Each object in the final output represents a section of the podcast script.
 */
const PodcastSectionSchema = z.object({
  speaker: z.string(),
  lines: z.array(z.string()),
});

/**
 * Output: an array of these sections in a structured format
 */
const OutputSchema = z.object({
  scriptSections: z.array(PodcastSectionSchema),
});

/**
 * Create a Genkit instance with the Google AI plugin.
 */
const ai = genkit({
  plugins: [googleAI()],
});

/**
 * The multi-step logic is all contained in one flow for demonstration, but you
 * could break it into subflows or separate custom functions.
 */
export const multiStepPodcastFlow = onFlow(
  ai,
  {
    name: "multiStepPodcastFlow",
    inputSchema: InputSchema,
    outputSchema: OutputSchema,
    authPolicy: firebaseAuth((user) => {
      if (!user) {
        throw new Error("User must be authenticated to run this flow");
      }
    }),
  },
  async (inputValues) => {
    // 1. Read the PDF
    const pdfPathAbsolute = path.join(process.cwd(), "src", inputValues.pdfPath);
    const pdfBuffer = await fs.readFile(pdfPathAbsolute);
    const parsedData = await pdfParse(pdfBuffer);
    const pdfContent = parsedData.text;

    // 2. Summarize the PDF in a more specific way
    const structuredSummaryPrompt = `
      You will read the following academic text carefully.
      Then, step by step, produce the following:
      1) A brief summary (2-3 paragraphs) that captures the main argument and context.
      2) A short list of direct quotes or excerpts (with page numbers if possible).
      3) A bullet-list outline of the key points or sections in the paper, focusing on its
         most interesting or controversial elements.

      Text Content:
      ${pdfContent}
    `;
    const structuredSummaryResponse = await ai.generate({
      model: gemini15Flash,
      prompt: structuredSummaryPrompt,
      config: { temperature: 0.8 },
    });

    // Imagine the response is structured in some format, e.g., a simple text delimitation:
    // "SUMMARY: ... QUOTES: ... OUTLINE: ..."
    // For simplicity, let's parse them out with naive splitting or a more robust approach
    // in a real-world scenario.
    const structuredSections = structuredSummaryResponse.text.split("QUOTES:");
    const summary = structuredSections[0].replace("SUMMARY:", "").trim();
    const quotesAndOutlineRaw = structuredSections[1] || "";
    const quotesBlock = quotesAndOutlineRaw.split("OUTLINE:")[0]?.trim();
    const outlineBlock = quotesAndOutlineRaw.split("OUTLINE:")[1]?.trim();

    // 3. Refine or highlight interesting angles:
    const discussionHookPrompt = `
      Below is an outline of the paper, followed by direct quotes and a short summary.

      SUMMARY:
      ${summary}

      QUOTES:
      ${quotesBlock}

      OUTLINE:
      ${outlineBlock}

      Please suggest some thought-provoking angles or "hooks" for a podcast conversation:
      - Summaries of controversies or debates in the text
      - Surprising data or insights
      - Real-world implications or hypothetical applications
      - Potential points of friendly disagreement

      Provide 5-7 bullet points, each with a specific question or angle of approach.
    `;
    const discussionHooksResponse = await ai.generate({
      model: gemini15Flash,
      prompt: discussionHookPrompt,
      config: { temperature: 0.7 },
    });
    const hooks = discussionHooksResponse.text
      .split(/\n/g)
      .map((line) => line.trim())
      .filter(Boolean);

    // 4. Create the final script with direct quotes and deeper commentary
    const finalScriptPrompt = `
      We have a summary, quotes, an outline, and these potential discussion hooks:
      ${hooks.join("\n")}

      Now create a podcast script for two hosts, Alex and Jamie, that:
      - References at least 2 direct quotes from the paper (and highlight them naturally in the conversation).
      - Explains some of the research or data.
      - Demonstrates curiosity and debate between the two hosts (sometimes they disagree or challenge each other).
      - Includes at least one comedic or lighthearted moment per key point.
      - Provides context so a listener learns something concrete about the paper's findings.
      - Allows for natural-sounding interjections ("Oh wow", "Wait, are you serious?") but keep them purposeful.
      - “Show” how to be engaging by giving examples in the conversation (not just telling them to “sound interesting”).
      
      Format the final script as valid JSON with the schema:
      [
        {
          "speaker": "Alex" or "Jamie",
          "lines": ["line 1", "line 2", ...]
        },
        ...
      ]

      IMPORTANT:
       - The conversation should use actual content from the summary and quotes above.
       - Keep it structured and ensure the final output is valid JSON only.
    `;
    const finalScriptResponse = await ai.generate({
      model: gemini15Flash,
      prompt: finalScriptPrompt,
      output: { format: "json", schema: OutputSchema },
      config: { temperature: 0.8 },
    });

    // Retrieve script sections
    const scriptSections = finalScriptResponse.output?.scriptSections || [];

    // Synthesize Audio
    const outputFileName = `podcast_audio_${Date.now()}.mp3`;
    await synthesizePodcastAudio(scriptSections, outputFileName);

    // Return the final script sections
    return {
      scriptSections,
    };
  }
);

export const testAudioFlow = onFlow(
  ai,
  {
    name: "testAudioFlow",
    inputSchema: z.object({}), // empty schema since we're hardcoding inputs
    outputSchema: z.object({
      audioFile: z.string()
    }),
    authPolicy: firebaseAuth((user) => {
      if (!user) {
        throw new Error("User must be authenticated to run this flow");
      }
    }),
  },
  async () => {
    const scriptSections = [
      {
        speaker: "Alex",
        lines: [
          "Hey Jamie, did you hear about the new tech release? Uh, it's supposed to be revolutionary.",
          "Yeah, I mean, it's like... you know, the next big thing, right?"
        ]
      },
      {
        speaker: "Jamie",
        lines: [
          "Oh, absolutely Alex! I was just reading about it, and it's, um, quite fascinating.",
          "I think it's going to change the way we, uh, interact with technology."
        ]
      },
      {
        speaker: "Alex",
        lines: [
          "Exactly! And, uh, the features they're introducing are just... wow.",
          "I can't wait to get my hands on it."
        ]
      },
      {
        speaker: "Jamie",
        lines: [
          "Same here! It's going to be a game-changer for sure.",
          "Let's see how it, uh, unfolds in the coming months."
        ]
      }
    ];

    const outputFileName = `test_audio_${Date.now()}.mp3`;
    await synthesizePodcastAudio(scriptSections, outputFileName);

    return {
      audioFile: outputFileName
    };
  }
);

/**
 * Our final podcast script structure, something like:
 * [
 *   {
 *     speaker: "Alex",
 *     lines: ["Hello, world!", "Another line from Alex."],
 *   },
 *   {
 *     speaker: "Jamie",
 *     lines: ["Hey Alex, good to be here!", "..."],
 *   },
 * ]
 */
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

