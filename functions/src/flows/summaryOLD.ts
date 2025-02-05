import { gemini15Flash } from "@genkit-ai/googleai";
import { SummaryOptions } from "../types";
import { ai } from "../config";
import { z } from 'genkit';

/**
 * Converts desired word count to approximate token count for AI models.
 * Uses conservative ratio of ~1.5 tokens per word for English text.
 * @param wordCount Desired maximum words
 * @returns Approximate maximum tokens needed
 */
function getTokensFromWords(wordCount: number): number {
  const TOKENS_PER_WORD = 1.5;
  return Math.ceil(wordCount * TOKENS_PER_WORD);
}

/**
 * Generates style-specific instructions for the summary
 * @param style The desired summary style ('bullet_points' or 'paragraph')
 * @returns Formatted style instructions string
 */
function getStyleInstructions(style: 'bullet_points' | 'paragraph'): string {
  switch (style) {
    case 'bullet_points':
      return `Please format the output as a clear and concise bullet-point summary that highlights the key points and main ideas using short, focused bullet points.`;

    case 'paragraph':
      return `Please format the output as a clear and concise paragraph summary that uses flowing narrative style.`;

    default:
      throw new Error('Invalid style option. Must be either "bullet_points" or "paragraph"');
  }
}

const summaryPrompt = (inputSources: string, options: SummaryOptions) => `
You are an AI summarization assistant.
Your job is to create a clear and focused summary of the input sources that captures the key points while meeting the specified length and style requirements.

Follow these guidelines:
- Stay within the specified word limit (${options.maxWords} words). Treat this as a general target.
- ${getStyleInstructions(options.style)}

### INPUT SOURCES
${inputSources}
`;

const fixWordcountPrompt = (summary: string, maxWords: number) => `
The input summary provided below is too long. The max number of words is ${maxWords}.

Please trim the summary such that it is less than ${maxWords} words, while preserving
the original text as closely as possible. 

Ensure that the final output is still a polished thought and a complete sentence.

### INPUT SUMMARY
${summary}
`;

export const formatSources = (input: string | string[]): string => {
    return Array.isArray(input) ? input.join('\n=========\n') : input;
}

export const generateSummary = ai.defineFlow(
  {
    name: 'generateSummary',
    inputSchema: z.object({
      options: z.object({
        maxWords: z.number(),
        style: z.enum(['bullet_points', 'paragraph'])
      }),
      input: z.union([z.string(), z.array(z.string())])
    }),
  },
  async (input): Promise<string> => {
    // Combine multiple inputs if array, separated by divider
    const combinedInput = formatSources(input.input);

    const prompt = summaryPrompt(combinedInput, input.options);
    console.log(prompt);
    // Use AI to generate summary
    const summaryResponse = await ai.generate({
      prompt,
      model: gemini15Flash,
      config: { 
        temperature: 0.7,
        ...(input.options.maxWords && { maxOutputTokens: getTokensFromWords(input.options.maxWords) })
      }
    });

    // Check if summary exceeds max words programmatically, and ask AI to rewrite if it is
    const wordCount = summaryResponse.text.split(/\s+/).length;
    if (wordCount > input.options.maxWords) {
      // Generate new summary with stricter word limit
      const fixedResponse = await ai.generate({
        prompt: fixWordcountPrompt(summaryResponse.text, input.options.maxWords),
        model: gemini15Flash,
        config: {
          temperature: 0.7,
          maxOutputTokens: getTokensFromWords(input.options.maxWords)
        }
      });
      
      return fixedResponse.text;
    }

    return summaryResponse.text;
  }
);