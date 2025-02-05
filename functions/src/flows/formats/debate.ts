import { z } from "genkit";
import { basePodcastOptionsSchema, moderatorSchema } from "../../types";
import { ai } from "../../config";
import * as admin from "firebase-admin";
import { gemini15Flash } from "@genkit-ai/googleai";

export const debateSideSchema = z.object({
    sideName: z.string(),
    speakers: z.array(z.string()),
    description: z.string().optional(),
    keyPoints: z.array(z.string()).optional()
  });
  
  export const debatePodcastOptionsSchema = basePodcastOptionsSchema.extend({
    format: z.literal("debate"),
    debateTopic: z.string().optional(),
    debateStructure: z.enum(["formal", "open"]).optional(),
    numRounds: z.number().min(1).max(10).optional(),
    moderator: moderatorSchema.optional(),
    autoAssignSides: z.boolean().optional(),
    sides: z.array(debateSideSchema).optional()
  });

const finalPodcastScriptInputSchema = z.object({
  summary: z.string(),
  hooks: z.array(z.string()),
  options: debatePodcastOptionsSchema,
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

export const debatePodcastScriptFlow = ai.defineFlow(
  {
    name: "debatePodcastScriptFlow",
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
      Create a debate-style podcast script featuring these speakers:
      ${speakerIntros}

      ${options.debateTopic ? 
        `The debate topic is: ${options.debateTopic}` : 
        'The debate topic should be inferred from the input content.'}

      The script should:
      - Include clear opening statements from each side
      - Feature structured rebuttals and counter-arguments
      - Use direct quotes and evidence to support positions
      - Maintain a respectful but passionate tone
      - Returns valid JSON array (speaker + lines)

      ${options.debateStructure === 'formal' ?
        'Structure this as a formal debate with clear rounds and timed responses.' :
        'Structure this as an open debate format with natural back-and-forth exchanges.'}
      
      ${options.moderator ? 
        `Include ${options.moderator.name} as a ${options.moderator.style} moderator to guide the debate${
          options.moderator.openingRemarks ? ', starting with opening remarks' : ''
        }${
          options.moderator.closingRemarks ? ' and ending with closing remarks' : ''
        }.` :
        'Allow the debate to flow naturally between speakers with minimal moderation.'}

      ${options.sides ? 
        `The debate sides are:\n${options.sides.map(side => 
          `- ${side.sideName}: ${side.speakers.join(', ')}${
            side.description ? `\n  Description: ${side.description}` : ''
          }${
            side.keyPoints ? `\n  Key Points: ${side.keyPoints.join(', ')}` : ''
          }`
        ).join('\n')}` :
        'Assign speakers to opposing sides based on the content and their backgrounds.'}

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