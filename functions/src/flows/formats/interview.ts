import { z } from "genkit";
import { basePodcastOptionsSchema } from "../../types";
import { ai } from "../../config";
import * as admin from "firebase-admin";
import { gemini15Flash } from "@genkit-ai/googleai";

export const interviewPodcastOptionsSchema = basePodcastOptionsSchema.extend({
    format: z.literal("interview"),
    
    // The guest being interviewed. AI will frame the interview around this speaker.
    // If omitted, AI picks the most relevant guest from `speakers[]`.
    intervieweeName: z.string().optional(),
    
    // The topic or guiding question for the interview.
    // If omitted, AI infers a topic based on input content.
    topic: z.string().optional(),
    
    // Defines how structured the interview should be:
    // - "scripted" → AI follows predefined questions
    // - "freeform" → AI asks dynamic, conversation-style questions
    interviewStyle: z.enum(["scripted", "freeform"]).optional(),
    
    // If true, multiple interviewers take turns asking questions.
    // If false, the first "host" in `speakers[]` is the only interviewer.
    rotatingInterviewers: z.boolean().optional(),
    
    // Max number of questions in the interview.
    // Defaults to 10 if unspecified.
    // Min: 3, Max: 20
    maxQuestions: z.number().min(3).max(20).optional()
  });

const finalPodcastScriptInputSchema = z.object({
  summary: z.string(),
  hooks: z.array(z.string()),
  options: interviewPodcastOptionsSchema,
  jobId: z.string()
});

const finalPodcastScriptOutputSchema = z.object({
  scriptSections: z.array(
    z.object({
      speaker: z.string(),
      lines: z.array(z.string()),
    })
  ),
});

export const interviewPodcastScriptFlow = ai.defineFlow(
  {
    name: "interviewPodcastScriptFlow",
    inputSchema: finalPodcastScriptInputSchema,
    outputSchema: finalPodcastScriptOutputSchema,
  },
  async (inputValues) => {
    const { summary, hooks, options, jobId } = inputValues;
    const jobRef = admin.firestore().collection('podcastJobs').doc(jobId);
    await jobRef.update({currentStep: 'generating_script'});

    const speakerIntros = options.speakers.map(speaker => 
      speaker.background ? 
        `${speaker.name} (${speaker.background})` :
        `${speaker.name}`
    ).join(', ');

    const prompt = `
      Create an interview-style podcast script featuring these speakers:
      ${speakerIntros}

      ${options.intervieweeName ? 
        `The main interviewee is: ${options.intervieweeName}` :
        'Select the most relevant speaker as the interviewee based on the content.'}

      ${options.topic ?
        `The interview topic is: ${options.topic}` :
        'The interview topic should be inferred from the input content.'}

      The script should:
      - Include thoughtful questions and detailed responses
      - Use direct quotes and specific examples
      - Create natural conversation flow
      - Balance depth with accessibility
      - Returns valid JSON array (speaker + lines)
      ${options.interviewStyle === 'scripted' ?
        'Structure this as a scripted interview with clear, pre-planned questions.' :
        'Structure this as a freeform interview with natural conversation flow, follow-up questions, and realistic speech patterns like "um", "uh", brief pauses (...), and occasional self-corrections that make it feel like an unplanned conversation.'}
      ${options.rotatingInterviewers ?
        'Multiple interviewers should take turns asking questions.' :
        'The first listed host should be the primary interviewer.'}

      ${options.maxQuestions ?
        `Include up to ${options.maxQuestions} main questions.` :
        'Include approximately 10 main questions.'}

      These scripts should be based on the following input sources (summarized below):
      ====== BEGIN SUMMARY ======
      ${summary}
      ====== END SUMMARY ======

      These are some conversational hooks that you can use for inspiration to develop the script:
      ====== BEGIN HOOKS ======
      ${hooks.join("\n")}
      ====== END HOOKS ======
    `;

    const scriptResponse = await ai.generate({
      model: gemini15Flash,
      prompt,
      config: { temperature: 0.8 },
      output: { schema: finalPodcastScriptOutputSchema },
    });

    const scriptSections = scriptResponse.output?.scriptSections || [];
    await jobRef.update({scriptCompleted: true});

    return { scriptSections };
  }
);