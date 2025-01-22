'use server'

import { multiStepPodcastFlow } from './flows';

export async function generatePodcast(formData: FormData) {
  const pdfPath = formData.get('pdfPath')?.toString() || 'example.pdf';
  return await multiStepPodcastFlow({ pdfPath });
} 