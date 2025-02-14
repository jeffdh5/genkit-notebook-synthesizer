import { RoundtablePodcastOptions } from "../schemas/podcast";

export const industryRoundtableConfig: RoundtablePodcastOptions = {
  format: "roundtable",
  title: "industry-roundtable",
  speakers: [
    { 
      name: "Alex Thompson", 
      voiceId: "en-US-Journey-D",
      background: "AI Ethics Researcher at EthicsAI" 
    },
    { 
      name: "Maria Garcia", 
      voiceId: "en-US-Journey-F",
      background: "Lead Data Scientist at TechCorp" 
    },
    { 
      name: "Dr. John Lee", 
      voiceId: "en-US-Neural2-D",
      background: "Machine Learning Engineer at DeepMind" 
    }
  ],
  discussionStyle: "industry_roundtable",
  structure: "moderated_topics",
  moderator: {
    name: "Emily Parker",
    voiceId: "en-US-Journey-F",
    style: "facilitating",
    openingRemarks: true,
    closingRemarks: true
  },
  bucketName: "smarthome-d6e27.firebasestorage.app",
  transcriptStorage: "transcripts",
  audioStorage: "audio"
}; 