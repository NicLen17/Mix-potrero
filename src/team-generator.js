import { getRandomTeamNames } from './team-names.js';

// Color themes for team cards (classic jersey vibes)
export const TEAM_THEMES = [
  {
    id: 'gold',
    name: 'Dorado',
    primary: '#f59e0b',
    gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(20, 30, 20, 0.95) 100%)',
    border: 'rgba(245, 158, 11, 0.5)',
    badgeBg: '#f59e0b',
    badgeText: '#0f172a',
    accent: '#fbbf24'
  },
  {
    id: 'celeste',
    name: 'Celeste',
    primary: '#38bdf8',
    gradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(15, 25, 35, 0.95) 100%)',
    border: 'rgba(56, 189, 248, 0.5)',
    badgeBg: '#38bdf8',
    badgeText: '#082f49',
    accent: '#7dd3fc'
  },
  {
    id: 'rojo',
    name: 'Rojo',
    primary: '#ef4444',
    gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(35, 15, 15, 0.95) 100%)',
    border: 'rgba(239, 68, 68, 0.5)',
    badgeBg: '#ef4444',
    badgeText: '#450a0a',
    accent: '#f87171'
  },
  {
    id: 'verde',
    name: 'Verde',
    primary: '#22c55e',
    gradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(10, 30, 15, 0.95) 100%)',
    border: 'rgba(34, 197, 94, 0.5)',
    badgeBg: '#22c55e',
    badgeText: '#052e16',
    accent: '#4ade80'
  }
];

/**
 * Shuffles an array in place using Fisher-Yates algorithm
 * @param {Array} array 
 * @returns {Array}
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Calculates the total rating of a team
 * @param {Array<{ rating: number }>} players 
 * @returns {number}
 */
function getTeamTotalRating(players) {
  return players.reduce((sum, p) => sum + (Number(p.rating) || 3), 0);
}

/**
 * Optimizes team balance using 2-opt swap search
 * @param {Array<Array>} teams 
 * @returns {Array<Array>}
 */
function optimizeTeamBalance(teams) {
  let improved = true;
  let iterations = 0;
  const maxIterations = 50;

  function getVariance(tList) {
    const sums = tList.map(getTeamTotalRating);
    const mean = sums.reduce((a, b) => a + b, 0) / sums.length;
    return sums.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
  }

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;

    let currentVariance = getVariance(teams);

    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        for (let pi = 0; pi < teams[i].length; pi++) {
          for (let pj = 0; pj < teams[j].length; pj++) {
            // Tentative swap
            const pA = teams[i][pi];
            const pB = teams[j][pj];

            teams[i][pi] = pB;
            teams[j][pj] = pA;

            const newVariance = getVariance(teams);

            if (newVariance < currentVariance - 0.01) {
              currentVariance = newVariance;
              improved = true;
            } else {
              // Revert
              teams[i][pi] = pA;
              teams[j][pj] = pB;
            }
          }
        }
      }
    }
  }

  return teams;
}

/**
 * Generates teams from player list
 * @param {Array<{ id: string, name: string, rating: number }>} players 
 * @param {number} numTeams 
 * @param {boolean} isBalanced 
 * @returns {Array<{ id: number, name: string, players: Array, totalRating: number, avgRating: number, theme: Object }>}
 */
export function generateTeams(players, numTeams = 2, isBalanced = false) {
  if (!players || players.length === 0) return [];

  const teamCount = Math.max(2, Math.min(4, Number(numTeams) || 2));
  const teamNames = getRandomTeamNames(teamCount);

  let teamBuckets = Array.from({ length: teamCount }, () => []);

  if (!isBalanced) {
    // Mode 1: Pure random distribution
    const shuffled = shuffleArray(players);
    shuffled.forEach((player, index) => {
      teamBuckets[index % teamCount].push(player);
    });
  } else {
    // Mode 2: Balanced Modo Crack (Snake draft + 2-opt refinement)
    // Add small random noise to break ties naturally
    const sorted = [...players].sort((a, b) => {
      const diff = (Number(b.rating) || 3) - (Number(a.rating) || 3);
      if (diff !== 0) return diff;
      return 0.5 - Math.random();
    });

    // Snake draft distribution
    let forward = true;
    let currentTeamIdx = 0;

    for (const player of sorted) {
      teamBuckets[currentTeamIdx].push(player);

      if (forward) {
        currentTeamIdx++;
        if (currentTeamIdx >= teamCount) {
          currentTeamIdx = teamCount - 1;
          forward = false;
        }
      } else {
        currentTeamIdx--;
        if (currentTeamIdx < 0) {
          currentTeamIdx = 0;
          forward = true;
        }
      }
    }

    // Refine with swap optimizer
    teamBuckets = optimizeTeamBalance(teamBuckets);
  }

  // Build final team objects
  return teamBuckets.map((teamPlayers, idx) => {
    const totalRating = getTeamTotalRating(teamPlayers);
    const avgRating = teamPlayers.length > 0 ? (totalRating / teamPlayers.length).toFixed(1) : 0;
    const theme = TEAM_THEMES[idx % TEAM_THEMES.length];

    return {
      id: idx + 1,
      name: teamNames[idx] || `Equipo ${idx + 1}`,
      players: teamPlayers,
      totalRating,
      avgRating: Number(avgRating),
      theme
    };
  });
}
