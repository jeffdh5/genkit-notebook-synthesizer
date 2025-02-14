import { DebatePodcastOptions } from "../schemas/podcast";

export const ethicalDebateConfig: DebatePodcastOptions = {
  format: "debate",
  title: "ethical-debate",
  speakers: [
    { 
      name: "Professor Smith", 
      voiceId: "en-US-Journey-D",
      background: "AI Safety Expert at Oxford" 
    },
    { 
      name: "Dr. Zhang", 
      voiceId: "en-US-Neural2-D",
      background: "AI Development Lead at OpenAI" 
    }
  ],
  debateTopic: "AI Safety vs Innovation Speed",
  debateStructure: "formal",
  numRounds: 3,
  moderator: {
    name: "Rachel Adams",
    voiceId: "en-US-Journey-F",
    style: "neutral",
    openingRemarks: true,
    closingRemarks: true
  },
  sides: [
    {
      sideName: "Safety First",
      speakers: ["Professor Smith"],
      keyPoints: ["Risk mitigation", "Ethical considerations", "Societal impact"]
    },
    {
      sideName: "Innovation Priority",
      speakers: ["Dr. Zhang"],
      keyPoints: ["Technological progress", "Economic benefits", "Global competitiveness"]
    }
  ],
  bucketName: "smarthome-d6e27.firebasestorage.app",
  transcriptStorage: "transcripts",
  audioStorage: "audio"
}; 