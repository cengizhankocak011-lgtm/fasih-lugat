export type PartOfSpeech = 'fiil' | 'isim' | 'harf' | 'sifat' | 'zarf' | 'zamir';

export type Bab = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface QuranExample {
  ayah: string;
  translation: string;
  reference: string;
}

export interface VerbConjugationSeed {
  bab: Bab;
  mazi: string; // past root form, e.g. كَتَبَ
  muzari: string; // present 3rd masc singular, e.g. يَكْتُبُ
  masdar: string;
  ismiFaail: string; // active participle
  ismiMefaul: string; // passive participle
  amar: string; // imperative masc singular
  passiveMazi: string; // كُتِبَ
  passiveMuzari: string; // يُكْتَبُ
  voice?: 'salim' | 'mudaaf' | 'naaqis' | 'ajwaf' | 'lafif';
}

export interface ParticleUsage {
  harf: string;
  meaning: string;
  example?: string;
}

export interface DictionaryEntry {
  id: string;
  word: string; // with tashkeel
  wordPlain: string; // without tashkeel
  pos: PartOfSpeech;
  root: string; // جذر
  meanings: string[]; // Turkish meanings
  synonyms?: string[];
  plural?: string; // جمع التكسير
  singular?: string;
  feminine?: string;
  verb?: VerbConjugationSeed;
  particles?: ParticleUsage[];
  examples: QuranExample[];
  tags?: string[];
  frequency?: 'high' | 'medium' | 'low';
}

export interface FavoriteItem {
  id: string;
  entryId: string;
  word: string;
  meaning: string;
  pos: PartOfSpeech;
  addedAt: number;
}

export interface HistoryItem {
  id: string;
  query: string;
  type: 'dictionary' | 'translate';
  direction?: 'ar-tr' | 'tr-ar';
  result?: string;
  timestamp: number;
}

export type ThemeMode = 'light' | 'dark';

export interface AppSettings {
  theme: ThemeMode;
}

export type TranslateDirection = 'ar-tr' | 'tr-ar';

export type Intent =
  | { kind: 'word'; query: string }
  | { kind: 'entry'; entryId: string }
  | { kind: 'translate'; text: string; direction: TranslateDirection };
