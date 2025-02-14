import fs from 'fs';
import pdf from 'pdf-parse';
import path from 'path';

const dataBuffer = fs.readFileSync(path.join(__dirname, 'regularization.pdf'));

async function getPdfText() {
  const data = await pdf(dataBuffer);
  return data.text;
}

async function loadInput() {
  const sourceText = await getPdfText();
  return sourceText;
}

import { synthesize } from '../../index';
import { SynthesisRequest } from '../../schemas/podcast';

async function generateSummary() {
  const inputText = await loadInput();
  const req: SynthesisRequest = {
    jobId: 'llm-paper-summary',
    input: inputText,
    output: [
      {
        type: 'podcast',
        options: {
          format: 'summary',
          length: 'short'
        }
      }
    ]
  }
  const result = await synthesize(req);
  console.log(result);
}

generateSummary();
