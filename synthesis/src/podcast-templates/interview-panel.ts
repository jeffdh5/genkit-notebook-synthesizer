import { InterviewPodcastOptions } from "../schemas/podcast";

export const panelInterviewConfig: InterviewPodcastOptions = {
  format: "interview",
  title: "panel-interview",
  speakers: [
    { 
      name: "Dr. Elena Rodriguez", 
      voiceId: "en-US-Journey-F",
      background: "Climate Science Researcher" 
    },
    { 
      name: "Michael Chang", 
      voiceId: "en-US-Journey-D",
      background: "Environmental Tech Journalist" 
    },
    { 
      name: "Amanda Foster", 
      voiceId: "en-US-Neural2-F",
      background: "Sustainability Expert" 
    }
  ],
  intervieweeName: "Dr. Elena Rodriguez",
  topic: "AI Applications in Climate Change",
  interviewStyle: "scripted",
  rotatingInterviewers: true,
  maxQuestions: 12,
  bucketName: "smarthome-d6e27.firebasestorage.app",
  transcriptStorage: "transcripts",
  audioStorage: "audio"
}; 