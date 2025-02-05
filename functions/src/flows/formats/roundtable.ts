import { z } from "genkit";
import { ai } from "../../config";
import { basePodcastOptionsSchema, moderatorSchema } from "../../types";
import * as admin from "firebase-admin";
import { gemini15Flash } from "@genkit-ai/googleai";

export const roundtablePodcastOptionsSchema = basePodcastOptionsSchema.extend({
  format: z.literal("roundtable"),
  discussionStyle: z.enum([
    "expert_panel", // In-depth discussion with domain experts
    "founders_chat", // Candid discussions between startup founders
    "trend_analysis", // Discussion focused on analyzing current trends
    "industry_roundtable", // Professionals discussing an industry challenge
    "brainstorm_session", // Free-flowing discussion of ideas & problem-solving
  ]),
  structure: z.enum([
    "open_discussion", // No strict topic control, speakers talk naturally
    "moderated_topics", // AI-guided transitions between structured topics
  ]),
  moderator: moderatorSchema.optional() // Optional moderator to guide discussion and ensure balanced speaking time
});


const finalPodcastScriptInputSchema = z.object({
  summary: z.string(),
  hooks: z.array(z.string()),
  options: roundtablePodcastOptionsSchema,
  jobId: z.string()
});

const finalPodcastScriptOutputSchema = z.object({
  script: z.array(
    z.object({
      speaker: z.string(),
      text: z.string(),
    })
  ),
});

export const roundtablePodcastScriptFlow = ai.defineFlow(
    {
      name: "roundtablePodcastScriptFlow",
      inputSchema: finalPodcastScriptInputSchema,
      outputSchema: finalPodcastScriptOutputSchema,
    },
    async (inputValues) => {
      const { summary, hooks, options, jobId } = inputValues;
      const jobRef = admin.firestore().collection('podcastJobs').doc(jobId);
      await jobRef.update({currentStep: 'generating_script'});
      
      const discussionStyleDescriptions = {
        expert_panel: "In-depth discussion with domain experts",
        founders_chat: "Candid discussions between startup founders",
        trend_analysis: "Discussion focused on analyzing current trends",
        industry_roundtable: "Professionals discussing an industry challenge", 
        brainstorm_session: "Free-flowing discussion of ideas & problem-solving",
        custom: options.discussionStyle || "Expert panel discussion"
      };
  
      let discussionStyleDescription = "";
      // Support custom discussion style as well
      if (options.discussionStyle && !discussionStyleDescriptions[options.discussionStyle]) {
        discussionStyleDescription = options.discussionStyle;
      } else {
        discussionStyleDescription = discussionStyleDescriptions[options.discussionStyle || "expert_panel"];
      }
  
      const speakerIntros = options.speakers.map(speaker => 
        speaker.background ? 
          `${speaker.name} (${speaker.background})` :
          `${speaker.name}`
      ).join(', ');
  
      const prompt = `
        Create a ${discussionStyleDescription} style roundtable podcast script featuring these speakers:
        ${speakerIntros}
  
        The script should:
        - Uses at least two direct quotes
        - Explains data/points
        - Includes some debate/disagreement
        - Has lighthearted/comedic lines
        - Returns valid JSON array (speaker + lines)
  
        ${options.structure === 'moderated_topics' ? 
          'Structure this as a moderated discussion with clear topic transitions.' :
          'Structure this as an open discussion where speakers can naturally interact.'}
        
        ${options.moderator ? 
          `Include ${options.moderator.name} as a ${options.moderator.style} moderator to guide the discussion${
            options.moderator.openingRemarks ? ', starting with opening remarks' : ''
          }${
            options.moderator.closingRemarks ? ' and ending with closing remarks' : ''
          }.` :
          'Allow the conversation to flow naturally between speakers. This is a discussion with no moderation, and speakers naturally interrupt each other.'}
  
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
  
      const script = scriptResponse.output?.script || [];
      await jobRef.update({scriptCompleted: true});
  
      // TODO: Optionally upload script to Cloud Storage
      return { script };
    }
  );