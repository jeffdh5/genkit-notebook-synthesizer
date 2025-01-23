'use server'
import { multiStepPodcastFlow } from './flows';

interface PodcastGenerationInput {
  pdfPath: string;
}

// DEMO ONLY - Makes a very simple LLM call
export async function generatePodcast(data: PodcastGenerationInput) {
  const pdfPath = data.pdfPath || 'example.pdf';
  console.log(`Generating podcast with PDF path: ${pdfPath}`);
  return await multiStepPodcastFlow({ pdfPath });
} 

// Generates real podcast, but code is WIP
import { endToEndPodcastFlow } from './flows';

interface EndToEndPodcastInput {
  sourceText: string;
}

export async function generatePodcastV2(data: EndToEndPodcastInput) {
  const { sourceText } = data;
  console.log(`Generating end-to-end podcast with source text of length: ${sourceText.length}`);
  return await endToEndPodcastFlow({ sourceText });
}
