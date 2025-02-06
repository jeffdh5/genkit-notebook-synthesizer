export const startupRoundtableConfig = {
  format: "roundtable",
  title: "startup-roundtable",
  speakers: [
    { 
      name: "Lisa Wong", 
      voiceId: "en-US-Journey-F",
      background: "Founder of AI Health Solutions" 
    },
    { 
      name: "Marcus Johnson", 
      voiceId: "en-US-Journey-D",
      background: "CEO of RoboTech Innovations" 
    },
    { 
      name: "Priya Patel", 
      voiceId: "en-US-Neural2-F",
      background: "Founder of DataMind Analytics" 
    }
  ],
  discussionStyle: "founders_chat",
  structure: "open_discussion",
  moderator: {
    name: "David Chen",
    voiceId: "en-US-Neural2-D",
    style: "facilitating",
    openingRemarks: true,
    closingRemarks: false
  },
  bucketName: "smarthome-d6e27.firebasestorage.app",
  transcriptStorage: "transcripts",
  audioStorage: "audio"
}; 