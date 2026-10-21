export interface SourceReference {
  title: string;
  url: string;
  license: string;
  retrievedAt: string;
  attribution: string;
  transformationSummary: string;
}

export interface LessonExample {
  code: string;
  explanation: string;
}

export interface CommonMisconception {
  misconception: string;
  correction: string;
}

export interface LessonRecord {
  id: string;
  topicKey: string;
  title: string;
  learningObjective: string;
  prerequisiteConcepts: string[];
  explanation: string;
  examples: LessonExample[];
  keyTakeaways: string[];
  commonMisconceptions: CommonMisconception[];
  sourceReferences: SourceReference[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  lastUpdated: string;
}

export interface ApprovedSource {
  id: string;
  topicKey: string;
  topicName: string;
  url: string;
  title: string;
  description: string;
  license: string;
  attributionNotice: string;
  lastIngestedAt?: string;
  status: 'seeded' | 'ready' | 'ingesting' | 'error';
  errorMessage?: string;
}

export interface IngestionLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export interface IngestionResponse {
  success: boolean;
  message: string;
  topicKey?: string;
  lesson?: LessonRecord;
  logs: IngestionLogEntry[];
  error?: string;
}
