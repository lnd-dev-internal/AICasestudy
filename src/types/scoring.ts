export interface ScoringCriterion {
  criterion: string;
  score: number;
  maxScore: number;
  justification: string;
  evidence: string[];
  improvementSuggestions: string[];
}

export interface ScoringResult {
  summary: string;
  overallStrengths: string[];
  overallWeaknesses: string[];
  finalRecommendation: string;
  totalScore: number;
  maxScore: number;
  criteria: ScoringCriterion[];
}

export interface ScoreSubmissionInput {
  candidateName?: string;
  roleTitle?: string;
  candidateAnswer: string;
  assignment: string;
  rubric: string;
}
