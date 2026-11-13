import type { VerbConjugationSeed, Bab } from '@/types';

/**
 * Arabic verb conjugation engine.
 * Generates full tables across persons (3 masc/fem, 2 masc/fem, 1 masc/fem + dual/plural)
 * for: Mazi (past), Muzari (present), active & passive, plus imperative & masdar.
 *
 * The engine uses the root letters (fa-ayn-lam) and the bab pattern to build forms.
 * For robustness with naaqis (weak final), ajwaf (weak middle), and mudaaf (hamza)
 * verbs, we rely on the seed's provided mazi/muzari stems and apply standard prefixes/suffixes.
 */

export type PersonKey =
  | '3ms' | '3md' | '3mp' | '3fs' | '3fd' | '3fp'
  | '2ms' | '2md' | '2mp' | '2fs' | '2fd' | '2fp'
  | '1s' | '1p';

export interface PersonRow {
  key: PersonKey;
  label: string; // Turkish label
  arabic: string; // pronoun in Arabic
}

export const PERSONS: PersonRow[] = [
  { key: '3ms', label: '3. tekil erkek', arabic: 'هُوَ' },
  { key: '3md', label: '3. ikil erkek', arabic: 'هُمَا' },
  { key: '3mp', label: '3. çoğul erkek', arabic: 'هُمْ' },
  { key: '3fs', label: '3. tekil kadın', arabic: 'هِيَ' },
  { key: '3fd', label: '3. ikil kadın', arabic: 'هُمَا' },
  { key: '3fp', label: '3. çoğul kadın', arabic: 'هُنَّ' },
  { key: '2ms', label: '2. tekil erkek', arabic: 'أَنْتَ' },
  { key: '2md', label: '2. ikil erkek', arabic: 'أَنْتُمَا' },
  { key: '2mp', label: '2. çoğul erkek', arabic: 'أَنْتُمْ' },
  { key: '2fs', label: '2. tekil kadın', arabic: 'أَنْتِ' },
  { key: '2fd', label: '2. ikil kadın', arabic: 'أَنْتُمَا' },
  { key: '2fp', label: '2. çoğul kadın', arabic: 'أَنْتُنَّ' },
  { key: '1s', label: '1. tekil', arabic: 'أَنَا' },
  { key: '1p', label: '1. çoğul', arabic: 'نَحْنُ' },
];

interface TenseSet {
  mazi: Record<PersonKey, string>;
  muzari: Record<PersonKey, string>;
  maziPassive: Record<PersonKey, string>;
  muzariPassive: Record<PersonKey, string>;
  imperative: Partial<Record<PersonKey, string>>; // only 2nd person
}

export interface ConjugationTable {
  bab: Bab;
  masdar: string;
  ismiFaail: string;
  ismiMefaul: string;
  tense: TenseSet;
}

// ===== Past (Mazi) suffixes =====
// The stem is taken from seed.mazi minus the final "a" vowel letter; we work with
// the bare stem and add person suffixes. For Arabic we keep harakat on the stem
// and append suffixes.
const MAZI_SUFFIX: Record<PersonKey, string> = {
  '3ms': 'َ',
  '3md': 'َا',
  '3mp': 'ُوا',
  '3fs': 'َتْ',
  '3fd': 'َتَا',
  '3fp': 'َنْ',
  '2ms': 'ْتَ',
  '2md': 'ْتُمَا',
  '2mp': 'ْتُمْ',
  '2fs': 'ْتِ',
  '2fd': 'ْتُمَا',
  '2fp': 'ْتُنَّ',
  '1s': 'ْتُ',
  '1p': 'ْنَا',
};

// ===== Present (Muzari) prefixes + suffixes =====
// The muzari stem (e.g. يَكْتُبُ) gives us the 3ms form. We extract the stem
// (without the leading prefix يَ and the trailing ُ) and recombine.
const MUZARI_PREFIX: Record<PersonKey, string> = {
  '3ms': 'يَ',
  '3md': 'يَ',
  '3mp': 'يَ',
  '3fs': 'تَ',
  '3fd': 'تَ',
  '3fp': 'يَ',
  '2ms': 'تَ',
  '2md': 'تَ',
  '2mp': 'تَ',
  '2fs': 'تَ',
  '2fd': 'تَ',
  '2fp': 'تَ',
  '1s': 'أَ',
  '1p': 'نَ',
};

const MUZARI_SUFFIX: Record<PersonKey, string> = {
  '3ms': 'ُ',
  '3md': 'َانِ',
  '3mp': 'ُونَ',
  '3fs': 'ُ',
  '3fd': 'َانِ',
  '3fp': 'ْنَ',
  '2ms': 'ُ',
  '2md': 'َانِ',
  '2mp': 'ُونَ',
  '2fs': 'ِينَ',
  '2fd': 'َانِ',
  '2fp': 'ْنَ',
  '1s': 'ُ',
  '1p': 'ُ',
};

// Passive muzari prefixes (same as active) but stem vowel pattern differs (يُفْعَلُ)
const MUZARI_PASSIVE_PREFIX: Record<PersonKey, string> = {
  '3ms': 'يُ',
  '3md': 'يُ',
  '3mp': 'يُ',
  '3fs': 'تُ',
  '3fd': 'تُ',
  '3fp': 'يُ',
  '2ms': 'تُ',
  '2md': 'تُ',
  '2mp': 'تُ',
  '2fs': 'تُ',
  '2fd': 'تُ',
  '2fp': 'تُ',
  '1s': 'أُ',
  '1p': 'نُ',
};

// Imperative (only 2nd person) — built from muzari by dropping the prefix and
// adding an eliding hamza. For simplicity we use the seed's amar for 2ms and
// derive the rest with the same suffixes as muzari 2nd person.
const IMPERATIVE_SUFFIX: Partial<Record<PersonKey, string>> = {
  '2ms': '',
  '2md': 'َا',
  '2mp': 'ُوا',
  '2fs': 'ِي',
  '2fd': 'َا',
  '2fp': 'ْنَ',
};

/**
 * Strip the trailing haraka from a stem to prepare for suffix attachment.
 */
function stripTrailingHaraka(s: string): string {
  const tashkeel = /[\u0618-\u061A\u064B-\u0652\u0670\u0640]/;
  let out = s;
  while (out.length && tashkeel.test(out[out.length - 1])) {
    out = out.slice(0, -1);
  }
  return out;
}

/**
 * Extract the "stem" from a 3ms mazi form like كَتَبَ → "كَتَب"
 * (drop the final fatha).
 */
function maziStem(mazi3ms: string): string {
  return stripTrailingHaraka(mazi3ms);
}

/**
 * Extract the inner stem from a 3ms muzari like يَكْتُبُ → "كْتُب"
 * (drop leading يَ and trailing ُ). We keep internal harakat.
 */
function muzariStem(muzari3ms: string): { stem: string } {
  // remove leading ي or ت or ن or أ with its haraka
  let s = muzari3ms;
  // Remove first letter (consonant) + its haraka
  const firstHarakaMatch = s.match(/^.\s*[\u064B-\u0652]?/);
  if (firstHarakaMatch) s = s.slice(firstHarakaMatch[0].length);
  // Remove trailing haraka
  s = stripTrailingHaraka(s);
  return { stem: s };
}

function muzariPassiveStem(muzari3ms: string): string {
  // For passive, the internal vowel pattern changes to fatha on the ayb.
  // يُفْعَلُ — we take the stem and change the middle vowel to fatha (َ).
  // This is a heuristic. For robust results we'd need the root; but since
  // we have the active stem, we swap the first internal haraka after the
  // first consonant to fatha.
  const { stem } = muzariStem(muzari3ms);
  // stem like كْتُب — we want كْتَب
  return stem.replace(/\u064F/, '\u064E'); // damma → fatha (first occurrence)
}

function imperativeBase(amar2ms: string): string {
  return stripTrailingHaraka(amar2ms);
}

export function conjugate(seed: VerbConjugationSeed): ConjugationTable {
  const maziSt = maziStem(seed.mazi);
  const { stem: muzSt } = muzariStem(seed.muzari);
  const muzPassSt = muzariPassiveStem(seed.muzari);
  const impBase = imperativeBase(seed.amar);

  const mazi: Record<PersonKey, string> = {} as Record<PersonKey, string>;
  const maziPassive: Record<PersonKey, string> = {} as Record<PersonKey, string>;
  const muzari: Record<PersonKey, string> = {} as Record<PersonKey, string>;
  const muzariPassive: Record<PersonKey, string> = {} as Record<PersonKey, string>;
  const imperative: Partial<Record<PersonKey, string>> = {};

  // Passive mazi stem: take كُتِبَ — we have seed.passiveMazi (3ms). Use same suffix logic.
  const maziPassSt = stripTrailingHaraka(seed.passiveMazi);

  for (const p of PERSONS) {
    mazi[p.key] = maziSt + MAZI_SUFFIX[p.key];
    maziPassive[p.key] = maziPassSt + MAZI_SUFFIX[p.key];
    muzari[p.key] = MUZARI_PREFIX[p.key] + muzSt + MUZARI_SUFFIX[p.key];
    muzariPassive[p.key] = MUZARI_PASSIVE_PREFIX[p.key] + muzPassSt + MUZARI_SUFFIX[p.key];
  }

  // Imperative — only 2nd person
  for (const key of ['2ms', '2md', '2mp', '2fs', '2fd', '2fp'] as PersonKey[]) {
    const suffix = IMPERATIVE_SUFFIX[key] ?? '';
    // For feminine plural and dual, we need to adapt the base.
    // 2ms base ends with no vowel; 2fs adds ـِي, etc.
    if (key === '2fs') {
      // base + ـِي : remove trailing sukun if any, then add kasra-ya
      imperative[key] = stripTrailingHaraka(impBase) + 'ِي';
    } else if (key === '2md' || key === '2fd') {
      imperative[key] = stripTrailingHaraka(impBase) + 'َا';
    } else if (key === '2mp') {
      imperative[key] = stripTrailingHaraka(impBase) + 'ُوا';
    } else if (key === '2fp') {
      imperative[key] = stripTrailingHaraka(impBase) + 'ْنَ';
    } else {
      imperative[key] = impBase + suffix;
    }
  }

  return {
    bab: seed.bab,
    masdar: seed.masdar,
    ismiFaail: seed.ismiFaail,
    ismiMefaul: seed.ismiMefaul,
    tense: { mazi, muzari, maziPassive, muzariPassive, imperative },
  };
}

export const BAB_NAMES: Record<Bab, string> = {
  1: 'I — نَصَرَ (فَعَلَ)',
  2: 'II — فَعَّلَ',
  3: 'III — فَاعَلَ',
  4: 'IV — أَفْعَلَ',
  5: 'V — تَفَعَّلَ',
  6: 'VI — تَفَاعَلَ',
  7: 'VII — اِنْفَعَلَ',
  8: 'VIII — اِفْتَعَلَ',
  9: 'IX — اِفْعَلَّ',
  10: 'X — اِسْتَفْعَلَ',
};
