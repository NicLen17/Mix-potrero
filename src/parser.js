import { storage } from './storage.js';

/**
 * Normalizes text capitalization (Title Case)
 * @param {string} str 
 * @returns {string}
 */
export function formatPlayerName(str) {
  if (!str) return '';
  return str
    .trim()
    .split(/\s+/)
    .map(word => {
      if (word.length === 0) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Checks if a line is likely a header/title rather than a player name
 * @param {string} rawLine 
 * @returns {boolean}
 */
function isHeaderLine(rawLine) {
  const line = rawLine.trim().toLowerCase();
  if (!line) return true;

  // Patterns common in football chat headers
  const headerPatterns = [
    /^(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)\b/i,
    /^(f[uú]tbol|fulbito|picado|partido|cancha|lista|equipos?|convocados?|confirmados?|anotados?)\b/i,
    /^(horario|hora|fecha|lugar|precio|cuota|suplentes|reservas?):?/i,
    /\b(futbol|fulbito|cancha\s*\d+|vs\.?|f\d+)\b/i
  ];

  // If it starts with a number like "1.", it's definitely a player item, not a header
  if (/^\s*\[?\d+[.)\]\-\s]/.test(rawLine)) {
    return false;
  }

  // If it matches header keywords and has multiple words or colons, it's a header
  for (const pattern of headerPatterns) {
    if (pattern.test(line)) {
      return true;
    }
  }

  return false;
}

/**
 * Cleans a single line removing bullet points, numbers, leading symbols and emojis
 * @param {string} rawLine 
 * @returns {string}
 */
export function cleanPlayerLine(rawLine) {
  let cleaned = rawLine.trim();

  // Remove leading numbers with dots, parens, brackets, dashes (e.g. "1.", "1)", "[1]", "1 -", "1 ")
  cleaned = cleaned.replace(/^\s*\[?\d+[\.\)\:\-\]\s]+/, '');

  // Remove any leading non-letter/non-number characters (bullets, emojis, hyphens, spaces)
  cleaned = cleaned.replace(/^[^\p{L}\p{N}]+/u, '');

  // Remove trailing emojis, punctuation or symbols but keep letters, numbers, dots, quotes, hyphens
  cleaned = cleaned.replace(/[^\p{L}\p{N}]+$/u, '');

  return cleaned.trim();
}

/**
 * Parses raw text input into a list of Player objects with duplicate disambiguation.
 * @param {string} text 
 * @returns {Array<{ id: string, name: string, rawName: string, rating: number }>}
 */
export function parsePlayerList(text) {
  if (!text || typeof text !== 'string') return [];

  const savedRatings = storage.getPlayerRatings();
  let lines = [];

  // Split by newlines first
  const rawLines = text.split(/\r?\n/);

  for (const rawLine of rawLines) {
    if (isHeaderLine(rawLine)) {
      continue;
    }

    // Check if the line itself contains comma-separated or semicolon-separated items
    if (rawLine.includes(',') && !/^\s*\d+[\.\)]/.test(rawLine)) {
      const parts = rawLine.split(/[,;]/);
      for (const part of parts) {
        const cleaned = cleanPlayerLine(part);
        if (cleaned.length > 0) {
          lines.push(cleaned);
        }
      }
    } else {
      const cleaned = cleanPlayerLine(rawLine);
      if (cleaned.length > 0) {
        lines.push(cleaned);
      }
    }
  }

  if (lines.length === 0) return [];

  // Count occurrences of each normalized name to apply automatic suffixes
  const nameOccurrences = {};
  const normalizedList = lines.map(name => formatPlayerName(name));

  for (const name of normalizedList) {
    const lower = name.toLowerCase();
    nameOccurrences[lower] = (nameOccurrences[lower] || 0) + 1;
  }

  // Current counter for assigning (1), (2), etc.
  const nameCurrentCount = {};

  return normalizedList.map((formattedName, index) => {
    const lower = formattedName.toLowerCase();
    let finalName = formattedName;

    if (nameOccurrences[lower] > 1) {
      nameCurrentCount[lower] = (nameCurrentCount[lower] || 0) + 1;
      finalName = `${formattedName} (${nameCurrentCount[lower]})`;
    }

    // Retrieve previous rating if available, or default to 3
    const savedRating = savedRatings[lower] || 3;

    return {
      id: `player_${index}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: finalName,
      baseName: formattedName,
      rating: savedRating
    };
  });
}
