// Common type definitions for the application

// Feedback structure based on DESIGN.md Section 5.3
export interface Feedback {
  goodPoints: string[];
  improvements: string[];
  correctedText: string;
  score: number; // 0-100
}
