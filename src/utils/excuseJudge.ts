import { ExcuseAnalysis, ExcuseCategory } from '../types';

interface KeywordRule {
  keywords: string[];
  weirdnessBonus: number;
  believabilityPenalty: number;
  creativityBonus: number;
  comedyBonus: number;
}

const RULES: KeywordRule[] = [
  // High absurdity, surreal, sci-fi, conspiracy, cosmic
  {
    keywords: [
      'alien', 'ufo', 'abduct', 'spaceship', 'portal', 'dimension', 'matrix', 'simulation',
      'conspiracy', 'illuminati', 'fbi', 'cia', 'secret agent', 'government', 'teleport',
      'wormhole', 'parallel universe', 'multiverse', 'ninja', 'laser', 'meteor', 'asteroid'
    ],
    weirdnessBonus: 48,
    believabilityPenalty: 45,
    creativityBonus: 42,
    comedyBonus: 40,
  },
  // Animals & creatures doing bizarre, suspicious or funny things
  {
    keywords: [
      'cat', 'dog', 'chicken', 'llama', 'pigeon', 'bird', 'squirrel', 'raccoon', 'duck',
      'goose', 'bear', 'hamster', 'judging', 'staring', 'hostage', 'demanded', 'chased',
      'monkey', 'penguin', 'ferret', 'parrot', 'stole', 'ate my', 'kidnapped', 'flock',
      'swarm', 'bee', 'wasp', 'octopus', 'shark', 'dinosaur', 'dragon', 'unicorn'
    ],
    weirdnessBonus: 40,
    believabilityPenalty: 35,
    creativityBonus: 38,
    comedyBonus: 42,
  },
  // Technology, appliances, objects acting human, dramatic, or emotional
  {
    keywords: [
      'wifi', 'wi-fi', 'alarm', 'speaking terms', 'emotionally unavailable', 'bluetooth',
      'laptop', 'computer', 'update', 'rebel', 'depressed', 'siri', 'alexa', 'ai', 'robot',
      'fridge', 'refrigerator', 'microwave', 'toaster', 'smart home', 'locked me', 'refused',
      'sentient', 'crying', 'existential crisis', 'zoom', 'internet'
    ],
    weirdnessBonus: 42,
    believabilityPenalty: 35,
    creativityBonus: 45,
    comedyBonus: 45,
  },
  // Physical impossibilities, supernatural, dramatic adventures
  {
    keywords: [
      'gravity', 'float', 'flying', 'ghost', 'haunted', 'time travel', 'sock', 'gnome',
      'cheese', 'void', 'existential', 'hypnotized', 'curse', 'witch', 'wizard', 'vampire',
      'zombie', 'apocalypse', 'lava', 'quicksand', 'pirate', 'battling', 'duel', 'chasm',
      'rescue', 'tree', 'roof', 'swallowed', 'exploded', 'mysterious'
    ],
    weirdnessBonus: 44,
    believabilityPenalty: 42,
    creativityBonus: 40,
    comedyBonus: 38,
  },
  // Dramatic, wild or suspicious life events
  {
    keywords: [
      'forgot what day', 'forgot day', 'lost my shoe', 'lost both shoes', 'stuck in elevator',
      'ate my homework', 'fell in a hole', 'alarm died', 'trapped in', 'costume', 'naked',
      'arrested', 'amnesia', 'twins', 'doppelganger', 'evil twin', 'prophecy', 'cult',
      'kidnap', 'heist', 'superhero', 'villain', 'spy', 'dance battle', 'ritual'
    ],
    weirdnessBonus: 38,
    believabilityPenalty: 30,
    creativityBonus: 35,
    comedyBonus: 38,
  },
  // Mundane, textbook, boring real-world excuses
  {
    keywords: [
      'traffic', 'headache', 'sick', 'fever', 'doctor', 'dentist', 'flat tire', 'late bus',
      'train delay', 'overslept', 'car broke', 'stomach ache', 'ill', 'flu', 'cold',
      'appointment', 'family emergency', 'alarm didn\'t go off', 'missed the alarm',
      'heavy traffic', 'car battery', 'spilled coffee'
    ],
    weirdnessBonus: -35,
    believabilityPenalty: -45, // Boosts believability to near max
    creativityBonus: -30,
    comedyBonus: -30,
  },
];

const VERDICTS_BY_CATEGORY: Record<ExcuseCategory, string[]> = {
  'Completely Normal': [
    'A textbook excuse. Completely believable and thoroughly uncreative.',
    'Boring, standard, and almost certainly true.',
    'No red flags detected. You might actually just be telling the truth.',
    'So mundane that even the strictest boss would accept it without question.',
  ],
  'Slightly Suspicious': [
    'Plausible on paper, but your body language would probably give you away.',
    'Convenient timing, though nothing outside the realm of possibility.',
    'A classic fallback excuse that raises an eyebrow, but passes inspection.',
    'Mildly suspicious, but everyone has had a day like that.',
  ],
  'Getting Weird': [
    'Things are beginning to bend the laws of average everyday logic.',
    'You are walking a very fine line between bad luck and sheer fiction.',
    'Interesting story. Any witnesses other than your potted plants?',
    'A solid attempt at dramatic narrative storytelling.',
  ],
  'Definitely Questionable': [
    'Your explanation requires a remarkably generous suspension of disbelief.',
    'If you said this under oath, the judge would ask for a short recess.',
    'Statistically, there is a 94% chance you simply did not want to leave your bed.',
    'Creative, bold, and heavily disputed by common sense.',
  ],
  'Extremely Weird': [
    'Your excuse has officially left the boundaries of standard reality.',
    'Even your cat’s lawyer wouldn’t dare present this in court.',
    'We are approaching critical levels of imaginative desperation.',
    'A masterclass in excuses that belong in a sci-fi comedy special.',
  ],
  'Absolutely Unhinged': [
    'This excuse exists in another metaphysical plane of consciousness.',
    'Ground control has lost all contact with this excuse.',
    'An astonishing masterpiece of pure, unfiltered chaos.',
    'Science cannot explain what happened, and frankly neither can you.',
  ],
};

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function validateExcuseInput(text: string): { isValid: boolean; warning?: string } {
  const cleaned = text.trim();
  if (!cleaned) {
    return { isValid: false, warning: 'Please enter an excuse first.' };
  }

  const normalized = cleaned.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const words = normalized.split(/\s+/).filter(Boolean);

  const greetings = [
    'hi', 'hello', 'hey', 'heyy', 'heyyy', 'yo', 'sup', 'hola', 'bonjour',
    'good morning', 'good afternoon', 'good evening', 'how are you', 'whats up',
    'what up', 'bye', 'goodbye', 'test', 'testing', 'ok', 'okay', 'yes', 'no',
    'asdf', 'qwerty', 'lol', 'haha', 'huh', 'what', 'cool', 'thanks', 'thank you'
  ];

  if (greetings.includes(normalized) || (words.length === 1 && greetings.includes(words[0]))) {
    return {
      isValid: false,
      warning: `"${cleaned}" is a greeting or chat, not an excuse! Tell us what happened (e.g. "I was late because...").`,
    };
  }

  if (cleaned.length < 8 || words.length < 2) {
    return {
      isValid: false,
      warning: 'That’s too short to be an excuse! Give us an actual reason why you couldn’t make it.',
    };
  }

  return { isValid: true };
}

export function analyzeExcuseLocally(excuse: string): ExcuseAnalysis {
  const text = excuse.toLowerCase().trim();
  const validation = validateExcuseInput(text);

  // If input is not an excuse (e.g. "hi", "hello", "test", single random word)
  if (!validation.isValid) {
    return {
      weirdness: 0,
      believability: 0,
      creativity: 0,
      comedy: 0,
      overall: 0,
      category: 'Completely Normal',
      verdict: `"${excuse.trim()}" is not an excuse! Give us an actual story or reason why you were late.`,
    };
  }

  const hash = simpleHash(text);
  const words = text.split(/\s+/).filter(Boolean);

  // Check if it's an obviously mundane / real-world excuse (traffic, sick, doctor, etc.)
  const isMundane = RULES[5].keywords.some((kw) => text.includes(kw));

  let weirdness = 50;
  let believability = 50;
  let creativity = 50;
  let comedy = 50;

  // Count matched rules
  let matchedRules = 0;
  for (const rule of RULES) {
    const hasKeyword = rule.keywords.some((kw) => text.includes(kw));
    if (hasKeyword) {
      weirdness += rule.weirdnessBonus;
      believability -= rule.believabilityPenalty;
      creativity += rule.creativityBonus;
      comedy += rule.comedyBonus;
      matchedRules++;
    }
  }

  // If the user provided an imaginative excuse that didn't hit predefined keywords,
  // evaluate narrative indicators, vocabulary complexity, and structural creativity!
  if (!isMundane && matchedRules === 0) {
    // Check for unusual or creative vocabulary
    const creativeIndicators = [
      'because', 'suddenly', 'accidentally', 'refused', 'trapped', 'stuck', 'escaped',
      'attacked', 'chased', 'lost', 'broke', 'stole', 'vanished', 'disappeared', 'flying',
      'screaming', 'crying', 'talking', 'sleeping', 'dancing', 'running', 'burning',
      'frozen', 'giant', 'tiny', 'strange', 'weird', 'crazy', 'magical', 'secret'
    ];
    let indicatorCount = 0;
    for (const ind of creativeIndicators) {
      if (text.includes(ind)) indicatorCount++;
    }

    // Long, expressive, or unusual phrases naturally get elevated creativity & weirdness
    const narrativeBoost = Math.min(35, words.length * 2 + indicatorCount * 8);
    weirdness += 15 + narrativeBoost;
    creativity += 20 + narrativeBoost;
    comedy += 18 + narrativeBoost;
    believability -= (15 + narrativeBoost);
  }

  // Additional narrative cues
  if (words.length >= 12) {
    creativity += 15;
    comedy += 10;
  }
  if (text.includes('!') || text.includes('?!') || text.includes('...')) {
    comedy += 10;
    weirdness += 5;
  }

  // Add deterministic jitter
  const jitter1 = (hash % 11) - 5;
  const jitter2 = ((hash >> 3) % 11) - 5;
  const jitter3 = ((hash >> 5) % 11) - 5;
  const jitter4 = ((hash >> 7) % 11) - 5;

  weirdness = Math.max(5, Math.min(99, weirdness + jitter1));
  believability = Math.max(5, Math.min(99, believability + jitter2));
  creativity = Math.max(5, Math.min(99, creativity + jitter3));
  comedy = Math.max(5, Math.min(99, comedy + jitter4));

  // Compute overall percentage score (weighted towards weirdness, comedy, and inverted believability)
  let overallRaw = Math.round(
    weirdness * 0.45 + comedy * 0.25 + creativity * 0.2 + (100 - believability) * 0.1
  );
  overallRaw = Math.max(5, Math.min(99, overallRaw));

  // Scale down to 1-10 (rounded to 1 decimal place or nice tenths)
  const weirdnessScore = Math.round((weirdness / 10) * 10) / 10;
  const believabilityScore = Math.round((believability / 10) * 10) / 10;
  const creativityScore = Math.round((creativity / 10) * 10) / 10;
  const comedyScore = Math.round((comedy / 10) * 10) / 10;
  const overallScore = Math.round((overallRaw / 10) * 10) / 10;

  // Determine category strictly matching user brackets on 1-10 scale
  let category: ExcuseCategory;
  if (overallScore <= 2.0) {
    category = 'Completely Normal';
  } else if (overallScore <= 4.0) {
    category = 'Slightly Suspicious';
  } else if (overallScore <= 6.0) {
    category = 'Getting Weird';
  } else if (overallScore <= 8.0) {
    category = 'Definitely Questionable';
  } else if (overallScore <= 9.5) {
    category = 'Extremely Weird';
  } else {
    category = 'Absolutely Unhinged';
  }

  // Pick verdict deterministically for this excuse
  const pool = VERDICTS_BY_CATEGORY[category];
  const verdictIndex = hash % pool.length;
  const verdict = pool[verdictIndex];

  return {
    weirdness: weirdnessScore,
    believability: believabilityScore,
    creativity: creativityScore,
    comedy: comedyScore,
    overall: overallScore,
    category,
    verdict,
  };
}
