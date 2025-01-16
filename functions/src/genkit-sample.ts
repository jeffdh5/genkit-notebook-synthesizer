// Import the Genkit core libraries and plugins.
import {genkit, z} from "genkit";
import {googleAI} from "@genkit-ai/googleai";
import fs from "fs/promises";
import path from "path";
import pdfParse from "pdf-parse";
import textToSpeech from "@google-cloud/text-to-speech";

import ffmpeg from "fluent-ffmpeg";
import { promisify } from "util";

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
      // For demonstration, we just require the user be logged in
      // Otherwise throw
      if (!user) {
        throw new Error("User must be authenticated to run this flow");
      }
    }),
  },
  async (inputValues) => {
    console.log('Starting multiStepPodcastFlow with input:', inputValues);

    // 1. Read and parse the PDF
    console.log('Reading PDF from:', inputValues.pdfPath);
    const pdfPathAbsolute = path.join(process.cwd(), "src", inputValues.pdfPath);
    const pdfBuffer = await fs.readFile(pdfPathAbsolute);
    const parsedData = await pdfParse(pdfBuffer);
    const pdfContent = parsedData.text;
    console.log('Successfully parsed PDF, content length:', pdfContent.length);

    // 2. Summarize the PDF
    console.log('Generating plain-English summary...');
    const summarizationPrompt = `
      Please read the following academic text and create a short, plain-English summary. 
      Keep it moderately informal so it's approachable:

      TEXT:
      ${pdfContent}
    `;
    const summaryResponse = await ai.generate({
      model: gemini15Flash,
      prompt: summarizationPrompt,
      config: { temperature: 0.9 },
    });
    const summary = summaryResponse.text.trim();
    console.log('Generated summary, length:', summary.length);

    // 3. Extract key subtopics
    console.log('Extracting key points...');
    const keyPointsPrompt = `
      Based on this summary:
      "${summary}"

      List the key themes or subtopics that would be interesting 
      discussion points for a podcast conversation.
      Format them as a bullet list and keep them short.
    `;
    const keyPointsResponse = await ai.generate({
      model: gemini15Flash,
      prompt: keyPointsPrompt,
      config: { temperature: 0.7 },
    });
    const keyPoints = keyPointsResponse.text.split(/\n/g).map((p) => p.trim()).filter(Boolean);
    console.log('Extracted key points:', keyPoints.length);

    // 4. Generate conversation hooks
    console.log('Generating banter lines...');
    const banterPrompt = `
      We have these key topics:
      ${keyPoints.join(", ")}

      Propose a few playful or engaging "banter" lines or transitions 
      that two hosts (Alex and Jamie) could use while discussing them.
    `;
    const banterRes = await ai.generate({
      model: gemini15Flash,
      prompt: banterPrompt,
      config: { temperature: 1.0 },
    });
    const banterLines = banterRes.text.split(/\n/g).map((p) => p.trim()).filter(Boolean);
    console.log('Generated banter lines:', banterLines.length);

    // 5. Synthesize final script
    console.log('Creating final script...');
    const finalScriptPrompt = `
      We have:
      - A summary of the paper:
        "${summary}"
      - Key points to discuss:
        ${keyPoints.join(", ")}
      - Some possible host banter or transitions:
        ${banterLines.join("\n")}

      Now produce a final script for a podcast with the two hosts, Alex and Jamie.
      Format it as an array of JSON objects. Each object should have:
        "speaker" (either "Alex" or "Jamie")
        "lines" (an array of strings representing what that speaker says).
      
      IMPORTANT:
        1. Do NOT include the speaker's name in the lines themselves (i.e., no "Alex:" text).
        2. Each object should contain dialogue only from the speaker specified in the "speaker" key.
        3. Make sure the JSON output is valid, with no extra keys or text.
    `;
    const finalScriptResponse = await ai.generate({
      model: gemini15Flash,
      prompt: finalScriptPrompt,
      // We can ask the model to produce JSON. We'll parse it into structured data.
      output: { format: "json", schema: OutputSchema }, 
      config: { temperature: 0.8 },
    });

    // Get the script sections from the final response
    const scriptSections = finalScriptResponse.output?.scriptSections || [];
    console.log('Generated script sections:', scriptSections.length);
    
    // Generate audio
    console.log('Starting audio synthesis...');
    await synthesizePodcastAudio(scriptSections, "finalPodcast.mp3");
    console.log('Audio synthesis complete');

    // Return the script sections as before
    return {
      scriptSections
    };
  }
);

export const podcastScriptFlow = onFlow(
  ai,
  {
    name: "podcastScriptFlow",
    inputSchema: z.object({
      pdfContent: z.string(),
    }),
    outputSchema: z.string(),
    authPolicy: firebaseAuth((user) => {
      // Add any additional auth requirements here
    }),
  },
  async ({pdfContent}) => {
    const response = await ai.generate({
      model: gemini15Flash,
      prompt: `
        Generate an engaging podcast script with two hosts discussing the following content.
        The hosts should be named Alex and Jamie. Make it conversational and natural, 
        including casual banter and back-and-forth discussion.
        
        Content to discuss:
        ${pdfContent}
        
        Format the output as a script with speaker names followed by their lines, like:
        Alex: [dialogue]
        Jamie: [dialogue]
      `
    });

    return response.text;
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
    const testText = "Hello! This is a simple test of the audio synthesis. I hope it works well!";
    console.log('Starting test audio synthesis with:', testText);

    const scriptSection = {
      speaker: "Alex",
      lines: [testText]
    };

    const outputFileName = `test_audio_${Date.now()}.mp3`;
    await synthesizePodcastAudio([scriptSection], outputFileName);

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
};

const writeFileAsync = promisify(fs.writeFile);

enum SsmlVoiceGender {
  UNSPECIFIED = "SSML_VOICE_GENDER_UNSPECIFIED",
  MALE = "MALE",
  FEMALE = "FEMALE",
  NEUTRAL = "NEUTRAL",
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
            ssmlGender: section.speaker === "Alex" ? SsmlVoiceGender.MALE : SsmlVoiceGender.FEMALE,
          },
          audioConfig: {
            audioEncoding: AudioEncoding.MP3,
          },
        };
        
        const [response] = await client.synthesizeSpeech(request);
        
        if (!response.audioContent) {
          throw new Error("No audio content received from Text-to-Speech API");
        }
        
        const segmentFileName = `segment_${segmentIndex}_${section.speaker}.mp3`;
        await writeFileAsync(segmentFileName, response.audioContent, "binary");
        segmentFiles.push(segmentFileName);
        segmentIndex++;
        console.log(`Wrote segment file: ${segmentFileName}`);
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

