export interface Bug {
  id: string;
  code: string;
  language: string;
  description: string;
  correctAnswer: string;
}

export interface Challenge {
  startTime: number;
  endTime: number | null;
  solution: string;
  isCorrect?: boolean;
}

export interface ComparisonResult {
  bugId: string;
  humanTime: number;
  llmTimes: Record<string, number>;
  isHumanCorrect: boolean;
  llmCorrectness: Record<string, boolean>;
}