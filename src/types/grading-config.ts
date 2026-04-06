export interface SavedDocumentConfig {
  filename: string;
  content: string;
  updatedAt: string;
}

export interface GradingConfig {
  roleTitle: string;
  assignment: SavedDocumentConfig | null;
  rubric: SavedDocumentConfig | null;
}
