export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface SavedRecipe {
  name: string;
  markdown: string;
  savedAt: string;
}

export interface Preferences {
  serves: number;
  dietary: string;
}

export type QuotaKind = 'quota' | 'rate_limit' | 'overloaded' | 'api';

export interface QuotaPayload {
  kind: QuotaKind;
  message?: string;
  retry_after?: string;
}
