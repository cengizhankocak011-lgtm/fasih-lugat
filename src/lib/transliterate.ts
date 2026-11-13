const FATHA = '\u064E';
const DAMMA = '\u064F';
const KASRA = '\u0650';
const FATHATAN = '\u064B';
const DAMMATAN = '\u064C';
const KASRATAN = '\u064D';
const SUKUN = '\u0652';
const SHADDA = '\u0651';
const TATWEEL = '\u0640';

const ALIF = '\u0627';
const ALIF_MADDA = '\u0622';
const ALIF_HAMZA_ABOVE = '\u0623';
const ALIF_HAMZA_BELOW = '\u0625';
const ALIF_MAKSURA = '\u0649';
const TA_MARBUTA = '\u0629';
const WAW = '\u0648';
const YA = '\u064A';

const VOWEL_SOUND: Record<string, string> = { [FATHA]: 'a', [KASRA]: 'i', [DAMMA]: 'u' };
const TANWIN_SOUND: Record<string, string> = { [FATHATAN]: 'an', [KASRATAN]: 'in', [DAMMATAN]: 'un' };

const LONG_VOWELS: Record<string, { letters: string[]; sound: string }> = {
  [FATHA]: { letters: [ALIF, ALIF_MAKSURA], sound: 'a' },
  [KASRA]: { letters: [YA], sound: 'i' },
  [DAMMA]: { letters: [WAW], sound: 'u' },
};

const CONSONANT_SOUND: Record<string, string> = {
  '\u0621': "'",
  '\u0622': "'",
  '\u0623': "'",
  '\u0624': "'",
  '\u0625': "'",
  '\u0626': "'",
  [ALIF]: '',
  '\u0628': 'b',
  [TA_MARBUTA]: 't',
  '\u062A': 't',
  '\u062B': 's',
  '\u062C': 'c',
  '\u062D': 'h',
  '\u062E': 'h',
  '\u062F': 'd',
  '\u0630': 'z',
  '\u0631': 'r',
  '\u0632': 'z',
  '\u0633': 's',
  '\u0634': 'ş',
  '\u0635': 's',
  '\u0636': 'd',
  '\u0637': 't',
  '\u0638': 'z',
  '\u0639': "'",
  '\u063A': 'ğ',
  '\u0641': 'f',
  '\u0642': 'k',
  '\u0643': 'k',
  '\u0644': 'l',
  '\u0645': 'm',
  '\u0646': 'n',
  '\u0647': 'h',
  [WAW]: 'v',
  [ALIF_MAKSURA]: '',
  [YA]: 'y',
};

const FINAL_DEVOICING: Record<string, string> = { b: 'p', d: 't', c: 'ç' };
const ALIF_INITIAL = new Set([ALIF_MADDA, ALIF_HAMZA_ABOVE, ALIF_HAMZA_BELOW, ALIF]);
const MARKS = new Set([FATHA, DAMMA, KASRA, FATHATAN, DAMMATAN, KASRATAN, SUKUN, SHADDA]);

function isLetter(c: string): boolean {
  return c in CONSONANT_SOUND;
}

function hasShaddaAfter(chars: string[], index: number, letter: string): boolean {
  if (chars[index] !== letter) return false;
  for (let k = index + 1; k < chars.length && MARKS.has(chars[k]); k++) {
    if (chars[k] === SHADDA) return true;
  }
  return false;
}

export function arabicReading(word: string): string | null {
  const chars = Array.from(word.normalize('NFC'));
  const hasVowel = chars.some((c) => c in VOWEL_SOUND || c in TANWIN_SOUND);
  if (!hasVowel) return null;

  let lastLetter = -1;
  chars.forEach((c, index) => {
    if (isLetter(c)) lastLetter = index;
  });

  let out = '';
  let i = 0;
  while (i < chars.length) {
    const c = chars[i];
    if (c === ' ') {
      out += ' ';
      i++;
      continue;
    }
    if (!isLetter(c)) {
      i++;
      continue;
    }

    const initial = i === 0 || chars[i - 1] === ' ';
    let j = i + 1;
    let shadda = false;
    let vowel: string | null = null;
    let tanwin: string | null = null;
    while (j < chars.length && (MARKS.has(chars[j]) || chars[j] === TATWEEL)) {
      if (chars[j] === SHADDA) shadda = true;
      else if (chars[j] in VOWEL_SOUND) vowel = chars[j];
      else if (chars[j] in TANWIN_SOUND) tanwin = chars[j];
      j++;
    }
    const isFinal = j > lastLetter;

    if (initial && ALIF_INITIAL.has(c)) {
      out += vowel ? VOWEL_SOUND[vowel] : 'e';
      i = j;
      continue;
    }

    let consumedTo = j;
    let vowelSound: string | null = null;
    if (vowel) {
      const long = LONG_VOWELS[vowel];
      const next = chars[j];
      if (long && next && long.letters.includes(next)) {
        vowelSound = long.sound;
        consumedTo = j + 1;
      } else {
        vowelSound = VOWEL_SOUND[vowel];
      }
    } else if (tanwin) {
      vowelSound = TANWIN_SOUND[tanwin];
    }

    let base = CONSONANT_SOUND[c];
    if (c === TA_MARBUTA && isFinal) base = '';
    if (isFinal && !vowelSound && base in FINAL_DEVOICING) base = FINAL_DEVOICING[base];
    if (initial && (c === '\u0621' || c === '\u0624' || c === '\u0626')) base = '';
    const articleLam = i > 0 && ALIF_INITIAL.has(chars[i - 1]) && (i === 1 || chars[i - 2] === ' ');
    if (articleLam && c === '\u0644' && !vowel && hasShaddaAfter(chars, j, c)) base = '';
    if (c === ALIF || c === ALIF_MAKSURA) base = vowelSound ? '' : 'a';

    out += shadda && base ? base + base : base;
    if (vowelSound) out += vowelSound;
    i = consumedTo;
  }

  const reading = out.replace(/\s+/g, ' ').trim();
  return reading || null;
}
