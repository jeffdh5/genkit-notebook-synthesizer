import { z } from "genkit";
import { roundtablePodcastOptionsSchema } from "./flows/formats/roundtable";
import { debatePodcastOptionsSchema } from "./flows/formats/debate";
import { interviewPodcastOptionsSchema } from "./flows/formats/interview";

export const speakerSchema = z.object({
  name: z.string(),
  voiceId: z.string().optional(),
  background: z.string().optional(), // Optional speaker background/bio
});

export const basePodcastOptionsSchema = z.object({
  speakers: z.array(speakerSchema),
  transcriptStorage: z.string().optional(),
  audioStorage: z.string().optional(),
  autoTitle: z.boolean().optional(),
  bucketName: z.string().optional(),
});

export const moderatorSchema = z.object({
  name: z.string(),
  voiceId: z.string().optional(),
  style: z.enum(["neutral", "assertive", "facilitating"]),
  gender: z.enum(["male", "female"]).optional(),
  speakingTime: z.number().min(1).max(10).optional(),
  openingRemarks: z.boolean().optional(),
  closingRemarks: z.boolean().optional()
});

// Defines a discriminated union of podcast format options, using the "format" field as the discriminator.
// This allows type-safe handling of the different podcast formats (interview, roundtable, debate)
// while ensuring the correct options schema is used for each format.
export const podcastOptionsSchema = z.discriminatedUnion("format", [
  interviewPodcastOptionsSchema,
  roundtablePodcastOptionsSchema,
  debatePodcastOptionsSchema
]);

export type InterviewPodcastOptions = z.infer<typeof interviewPodcastOptionsSchema>;
export type RoundtablePodcastOptions = z.infer<typeof roundtablePodcastOptionsSchema>;
export type DebatePodcastOptions = z.infer<typeof debatePodcastOptionsSchema>;
export type PodcastOptions = InterviewPodcastOptions | RoundtablePodcastOptions | DebatePodcastOptions;


// CODE AFTER HERE IS WIP - may no be used yet


/**
 * Expected Synthesis Result
 */
export interface StudyGuideSection {
  title: string;
  content: string;
}


export type OutputType =
  | "summary"
  | "study_guide"
  | "podcast";

/**
 * Summary Options
 * Generates a condensed version of the input text
 */
export interface SummaryOptions {
  maxWords: number;
  style: "bullet_points" | "paragraph";
}

/**
 * Study Guide Options
 * Converts content into an educational format
 */
export interface StudyGuideOptions {
  sections?: number; // Min: 1, Max: 10
  sectionTitles?: string[]; // Optional custom section labels
  numQuestions?: number; // Min: 1, Max: 50
  questionsPerSection?: boolean; // Whether questions are evenly distributed across sections
  questionFormat?: ("multiple_choice" | "open_ended" | "true_false" | "fill_in_the_blank")[];
  layout?: "summary_plus_questions" | "detailed_notes";
}

// Define the valid output configurations
export type OutputConfig =
  | { type: "summary"; options: SummaryOptions }
  | { type: "study_guide"; options: StudyGuideOptions }
  | { type: "podcast"; options: PodcastOptions }


/**
 * Main Synthesis Request
 */
export interface SynthesisRequest {
    /** The input source(s) for synthesis */
    input: string | string[]; // Supports multiple sources (PDFs, URLs, etc.)
    /** The desired output formats */
    output: OutputConfig[]; // Supports multiple output types in a single request
  }

export interface SynthesisResult {
  summary?: string;
  studyGuide?: StudyGuideSection[];
  podcast?: PodcastResult;
}

// TODO: Need to figure out how to handle remote storage of the actual files generated
export interface PodcastResult {
  transcript: string;
  duration: number;
}