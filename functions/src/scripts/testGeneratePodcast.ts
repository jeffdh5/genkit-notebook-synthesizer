import { synthesize } from '../synthesis';
import pdf from 'pdf-parse';
import fs from 'fs/promises';

async function testSynthesizeDirectly() {
  console.log('Testing synthesize directly...');
  
  try {
    // Read and parse the PDF file
    const dataBuffer = await fs.readFile('src/paper.pdf');
    const pdfData = await pdf(dataBuffer);

    const result = await synthesize({
      jobId: "test-job-" + Date.now(),
      input: pdfData.text,
      output: [
        {
          type: "podcast",
          options: {
            format: "debate",
            speakers: [
              { name: "Alex", voiceId: "en-US-Journey-D" },
              { name: "Sarah", voiceId: "en-US-Journey-F" }
            ],
            bucketName: "smarthome-d6e27.firebasestorage.app",
            transcriptStorage: "transcripts",
            audioStorage: "audio",
          }
        }
      ]
    });
    console.log('Synthesis completed:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run both tests
async function runTests() {
  await testSynthesizeDirectly();
}

runTests().catch(console.error);