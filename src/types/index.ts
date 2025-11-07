// Common type definitions for the application

// Feedback structure for speech evaluation
export interface Feedback {
  goodPoints: string[];
  improvements: string[];
  correctedText: string;
  score: number; // 0-100
}
