import { synthesize } from '../synthesis';
import pdf from 'pdf-parse';
import fs from 'fs/promises';
import { 
  expertInterviewConfig,
  industryRoundtableConfig,
  ethicalDebateConfig,
  startupRoundtableConfig,
  panelInterviewConfig
} from '../podcast-templates';

async function generatePodcastFromTemplate(
  pdfText: string, 
  templateName: string, 
  config: any
) {
  console.log(`\nGenerating ${templateName} podcast...`);
  try {
    const result = await synthesize({
      jobId: `test-${templateName}-${Date.now()}`,
      input: pdfText,
      output: [
        {
          type: "podcast",
          options: config
        }
      ]
    });
    console.log(`✓ ${templateName} generation completed`);
    return result;
  } catch (error) {
    console.error(`✗ Error generating ${templateName}:`, error);
    return null;
  }
}

async function testAllTemplates() {
  console.log('Starting podcast template tests...');
  
  try {
    // Read and parse the PDF file
    const dataBuffer = await fs.readFile('src/paper.pdf');
    const pdfData = await pdf(dataBuffer);

    // Test each template configuration
    const templates = [
      { name: 'expert-interview', config: expertInterviewConfig },
      { name: 'industry-roundtable', config: industryRoundtableConfig },
      { name: 'ethical-debate', config: ethicalDebateConfig },
      { name: 'startup-roundtable', config: startupRoundtableConfig },
      { name: 'panel-interview', config: panelInterviewConfig }
    ];

    // Process templates sequentially to avoid overwhelming the system
    for (const template of templates) {
      await generatePodcastFromTemplate(
        pdfData.text,
        template.name,
        template.config
      );
    }

    console.log('\nAll template tests completed!');
  } catch (error) {
    console.error('Error reading PDF:', error);
  }
}

// Run the tests
console.log('🎙️  Testing Podcast Templates 🎙️');
console.log('================================');
testAllTemplates().catch(console.error); 