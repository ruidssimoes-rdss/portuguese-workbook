export interface Saying {
  id: string;
  portuguese: string;
  pronunciation: string;
  literal: string;
  meaning: string;
  usage: string;
  example?: string;
  exampleTranslation?: string;
  theme: string;
  cefr: string;
}

export interface SayingsData {
  sayings: Saying[];
}
