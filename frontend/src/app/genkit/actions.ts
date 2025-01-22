'use server'

import { multiStepPodcastFlow } from './flows';

interface PodcastGenerationInput {
  pdfPath: string;
}

export async function generatePodcast(data: PodcastGenerationInput) {
  const pdfPath = data.pdfPath || 'example.pdf';
  console.log(`Generating podcast with PDF path: ${pdfPath}`);
  return await multiStepPodcastFlow({ pdfPath });
} 