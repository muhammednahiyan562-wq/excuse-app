export type ExcuseCategory =
  | 'Completely Normal'
  | 'Slightly Suspicious'
  | 'Getting Weird'
  | 'Definitely Questionable'
  | 'Extremely Weird'
  | 'Absolutely Unhinged';

export interface ExcuseAnalysis {
  weirdness: number;
  believability: number;
  creativity: number;
  comedy: number;
  overall: number;
  category: ExcuseCategory;
  verdict: string;
}

export interface RateExcuseRequest {
  excuse: string;
}

export interface RateExcuseResponse {
  success: boolean;
  data?: ExcuseAnalysis;
  error?: 'MISSING_KEY' | 'RATE_LIMIT' | 'GENERAL_ERROR';
  message?: string;
}
