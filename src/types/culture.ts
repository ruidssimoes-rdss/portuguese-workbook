export interface FalseFriend {
  id: string;
  portuguese: string;
  pronunciation: string;
  looksLike: string;
  actualMeaning: string;
  correctWord: string;
  correctWordMeaning: string;
  example: string;
  exampleTranslation: string;
  tip: string;
  cefr: string;
}

export interface FalseFriendsData {
  falseFriends: FalseFriend[];
}

export interface EtiquetteTip {
  id: string;
  title: string;
  titlePt: string;
  description: string;
  doThis: string;
  avoidThis: string;
  example?: string;
  category: string;
}

export interface EtiquetteData {
  tips: EtiquetteTip[];
}

export interface RegionalExpression {
  id: string;
  expression: string;
  pronunciation: string;
  meaning: string;
  region: string;
  standardAlternative: string;
  example: string;
  exampleTranslation: string;
  cefr: string;
}

export interface RegionalData {
  expressions: RegionalExpression[];
}
