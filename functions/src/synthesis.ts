import { PodcastOptions, SynthesisRequest, SynthesisResult, PodcastResult } from './types';
//import { generateSummary } from './flows/summaryOLD';
import { endToEndPodcastFlow } from './flows';

export async function synthesize(request: SynthesisRequest): Promise<SynthesisResult> {
  console.log("REQ", JSON.stringify(request, null, 2));
  const results: SynthesisResult = {};
  
  for (const output of request.output) {
    switch (output.type) {
      // in the future, support additional types
      case 'podcast':
        results.podcast = await generatePodcast(request.input, output.options);
        break;
    }
  }
  
  return results;
}

async function generatePodcast(input: string | string[], options: PodcastOptions): Promise<PodcastResult> {
  // Generate a unique job ID for tracking this podcast generation
  const jobId = `podcast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Convert input to array if single string
  const sourceTexts = Array.isArray(input) ? input : [input];

  // Call the end-to-end podcast generation flow
  const result = await endToEndPodcastFlow({
    sourceTexts,
    jobId,
    options
  });

  return {
    transcript: JSON.stringify(result.script),
  };
}
