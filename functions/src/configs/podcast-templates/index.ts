export { expertInterviewConfig } from './interview-expert';
export { industryRoundtableConfig } from './roundtable-industry';
export { ethicalDebateConfig } from './debate-ethical';
export { startupRoundtableConfig } from './roundtable-startup';
export { panelInterviewConfig } from './interview-panel';

// Example usage:
/*
import { expertInterviewConfig } from './configs/podcast-templates';

const result = await synthesize({
  jobId: "test-interview-" + Date.now(),
  input: pdfData.text,
  output: [
    {
      type: "podcast",
      options: expertInterviewConfig
    }
  ]
});
*/ 