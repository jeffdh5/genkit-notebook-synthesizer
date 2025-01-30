export type OutputType =
  | "summary"
  | "study_guide"
  | "FAQ"
  | "briefing_doc"
  | "timeline"
  | "podcast"
  | "debate";

/**
 * Summary Options
 * Generates a condensed version of the input text
 */
export interface SummaryOptions {
  max_words: number; // Min: 20, Max: 1000
  style: "bullet_points" | "paragraph";
  structure?: "single_block" | "sections";
  sectionTitles?: string[]; // Optional custom section labels (if structure = "sections")
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

export interface PodcastSpeaker {
  name: string; // Speaker's name (e.g., "Dr. Jane Smith")
  role: "host" | "guest" | "expert" | "panelist"; // Defines their role in the discussion
  gender: "male" | "female"; // Determines AI voice selection
  voiceId?: string; // Optional: Custom TTS voice model
  wpm?: number; // Desired speaking speed (Min: 75, Max: 400 WPM)
  speakingRateOverride?: number; // Directly set Google TTS `speaking_rate`
}
  
/**
 * Podcast Options
 * Generates a structured podcast script
 */
export interface BasePodcastOptions {
  speakers: PodcastSpeaker[]; // List of AI-generated speakers
  duration: number; // Total podcast length in minutes (Min: 5, Max: 60)
  maxSpeakerTime?: number; // Max speaking time per speaker (Min: 1, Max: 10 minutes)
  scriptStyle?: "structured" | "freeform"; // "structured" follows an AI-generated format, "freeform" is more natural
  transcriptStorage?: string; // Cloud storage path for transcript (e.g., "gs://my-bucket/transcripts/")
  audioStorage?: string; // Cloud storage path for final audio file (e.g., "gs://my-bucket/audio/")
  returnUrls?: boolean; // If true, API returns public URLs to access stored transcript/audio
  preSummarize?: boolean; // If true, condenses long inputs before script generation
  allowFiller?: boolean; // If true, AI adds natural pauses, greetings, and transitions
  maxScriptLength?: number; // Max words allowed in the AI-generated script
  fallbackVoice?: string; // Alternative voice model if the selected one fails
  retentionDays?: number; // Auto-delete storage files after X days (optional)
  privateStorage?: boolean; // If true, prevents public access to generated files
  generateShowNotes?: boolean; // If true, AI generates formatted podcast notes
  autoTitle?: boolean; // If true, AI generates a podcast title
  rssCompatible?: boolean; // If true, generates metadata in RSS format for podcast hosting
}

export interface InterviewPodcastOptions extends BasePodcastOptions {
  format: "interview";

  /**
   * The guest being interviewed.
   * AI will frame the interview around this speaker.
   * If omitted, AI picks the most relevant guest from `speakers[]`.
   */
  intervieweeName?: string;

  /**
   * The topic or guiding question for the interview.
   * If omitted, AI infers a topic based on input content.
   */
  topic?: string;

  /**
   * Defines how structured the interview should be.
   * - "scripted" → AI follows predefined questions.
   * - "freeform" → AI asks dynamic, conversation-style questions.
   */
  interviewStyle?: "scripted" | "freeform";

  /**
   * If true, multiple interviewers take turns asking questions.
   * If false, the first "host" in `speakers[]` is the only interviewer.
   */
  rotatingInterviewers?: boolean;

  /**
   * Max number of questions in the interview.
   * Defaults to 10 if unspecified.
   */
  maxQuestions?: number; // Min: 3, Max: 20
}
export interface RoundtablePodcastOptions extends BasePodcastOptions {
  format: "roundtable";

  /**
   * Defines the style of discussion.
   * - "expert_panel" → In-depth discussion with domain experts.
   * - "founders_chat" → Candid discussions between startup founders.
   * - "trend_analysis" → Discussion focused on analyzing current trends.
   * - "industry_roundtable" → Professionals discussing an industry challenge.
   * - "brainstorm_session" → Free-flowing discussion of ideas & problem-solving.
   * - "custom" → User-defined description of discussion style.
   */
  discussionStyle?: "expert_panel" | "founders_chat" | "trend_analysis" | "industry_roundtable" | "brainstorm_session" | { custom: string };

  /**
   * Defines the structure of the conversation.
   * - "open_discussion" → No strict topic control, speakers talk naturally.
   * - "moderated_topics" → AI-guided transitions between structured topics.
   */
  structure?: "open_discussion" | "moderated_topics";

  /**
   * If true, an AI-generated moderator ensures balanced speaking time
   * and transitions between topics when necessary.
   */
  includeModerator?: boolean;

  /**
   * Maximum duration per speaker before switching.
   * Helps ensure balanced speaking time.
   */
  maxSpeakerTime?: number; // Min: 1, Max: 10 minutes
}

export interface DebatePodcastOptions extends BasePodcastOptions {
  format: "debate";

  /**
   * The central question or topic of the debate.
   * If omitted, AI infers a topic based on the input content.
   */
  debateTopic?: string;

  /**
   * Defines the debate structure.
   * - "formal" → Speakers take turns making structured arguments.
   * - "open" → Free-flowing discussion with interjections.
   */
  debateStructure?: "formal" | "open";

  /**
   * The number of debate rounds (for "formal" debates).
   * Each round allows speakers to present arguments and rebuttals.
   */
  numRounds?: number; // Min: 1, Max: 10

  /**
   * The name of the AI-generated moderator.
   * If provided, AI will include a moderator to guide the discussion.
   */
  moderator?: DebateModerator;

  /**
   * If true, AI automatically defines sides and assigns speakers.
   * If false, user must provide `sides` to structure the debate.
   */
  autoAssignSides?: boolean;

  /**
   * Defines debate sides manually.
   * If omitted, AI assigns speakers to positions based on the topic.
   */
  sides?: {
    sideName: string; // Name of the stance (e.g., "Pro AI Regulation")
    speakers: string[]; // List of speaker names assigned to this side
    description?: string; // Brief explanation of this side's key arguments/position
    keyPoints?: string[]; // Main talking points for this side to cover
  }[];
}

export interface DebateModerator {
  name: string; // Moderator's name
  gender: "male" | "female"; // For voice selection
  voiceId?: string; // Optional custom voice
  style: "neutral" | "assertive" | "facilitating"; // Moderation style
  speakingTime?: number; // Minutes allocated for moderator (Min: 1, Max: 10)
  openingRemarks?: boolean; // Whether to include moderator intro
  closingRemarks?: boolean; // Whether to include moderator conclusion
}

export type PodcastOptions = InterviewPodcastOptions | RoundtablePodcastOptions | DebatePodcastOptions;

// Define the valid output configurations
export type OutputConfig =
  | { type: "summary"; options: SummaryOptions }
  | { type: "study_guide"; options: StudyGuideOptions }
  | { type: "podcast"; options: PodcastOptions }

/**
 * Expected Synthesis Result
 */
export interface StudyGuideSection {
  title: string;
  content: string;
}

export interface PodcastResult {
  transcript: string;
  duration: number;
}

export interface DebateArgument {
  round: number;
  speaker: string;
  argument: string;
}

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

/**
 * Main function for AI-powered synthesis
 */
export function synthesize(request: SynthesisRequest): Promise<SynthesisResult> {
  return Promise.resolve({
    summary: "This is a sample summary of the content.",
    studyGuide: [
      {
        title: "Key Concepts",
        content: "Sample study guide content covering main topics"
      }
    ],
    faq: [
      {
        question: "What is this about?",
        answer: "This is a sample FAQ answer"
      }
    ],
    briefingDoc: [
      {
        section: "Overview",
        content: "Sample briefing document content"
      }
    ],
    timeline: [
      {
        event: "Sample Event",
        date: "2024-01-01"
      }
    ],
    podcast: {
      transcript: "Sample podcast transcript content",
      duration: 300 // 5 minutes in seconds
    },
    debate: [
      {
        round: 1,
        speaker: "Speaker 1",
        argument: "Sample debate argument"
      }
    ]
  });
}
