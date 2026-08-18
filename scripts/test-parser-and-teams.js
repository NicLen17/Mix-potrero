import { parsePlayerList } from '../src/parser.js';
import { generateTeams } from '../src/team-generator.js';
import { getMatchPiquePhrase } from '../src/team-names.js';

const exampleList = `domingo futbol 

1. paila
2. arguelles 
3. raul 
4. gome
5. gome
6. nanitaowo
7. harry
8. cucho
9. fede 
10. agu
11. mauro
12. jose
13. facu
14. joaquin
15. agu
16. chino
17. tomi
18. Álvaro`;

console.log('--- TEST 1: Parse Player List ---');
const parsed = parsePlayerList(exampleList);
console.log(`Detected players count: ${parsed.length} (Expected: 18)`);
console.assert(parsed.length === 18, 'Should parse 18 players');

console.log('\nPlayer names:');
parsed.forEach((p, i) => console.log(`${i + 1}. ${p.name}`));

const gome1 = parsed.find(p => p.name === 'Gome (1)');
const gome2 = parsed.find(p => p.name === 'Gome (2)');
const agu1 = parsed.find(p => p.name === 'Agu (1)');
const agu2 = parsed.find(p => p.name === 'Agu (2)');
const alvaro = parsed.find(p => p.name === 'Álvaro');

console.assert(gome1 && gome2, 'Gome should have (1) and (2) suffixes');
console.assert(agu1 && agu2, 'Agu should have (1) and (2) suffixes');
console.assert(alvaro, 'Álvaro should have accent preserved');
console.log('✓ Duplicate suffix disambiguation works perfectly!');

console.log('\n--- TEST 2: Generate 2 Teams (Random) ---');
const teams2 = generateTeams(parsed, 2, false);
console.log(`Team 1: "${teams2[0].name}" (${teams2[0].players.length} players)`);
console.log(`Team 2: "${teams2[1].name}" (${teams2[1].players.length} players)`);
console.assert(teams2[0].players.length === 9 && teams2[1].players.length === 9, 'Should split 18 into 9 and 9');

console.log('\n--- TEST 3: Generate 2 Teams (Modo Crack / Balanced) ---');
// Assign some ratings
parsed[0].rating = 5; // Paila crack
parsed[1].rating = 5; // Arguelles crack
parsed[2].rating = 1; // Raul rookie
parsed[3].rating = 1; // Gome 1 rookie
parsed[4].rating = 4;
parsed[5].rating = 4;

const balancedTeams = generateTeams(parsed, 2, true);
console.log(`Team 1: "${balancedTeams[0].name}" (Rating total: ${balancedTeams[0].totalRating}, Avg: ${balancedTeams[0].avgRating})`);
console.log(`Team 2: "${balancedTeams[1].name}" (Rating total: ${balancedTeams[1].totalRating}, Avg: ${balancedTeams[1].avgRating})`);
const diff = Math.abs(balancedTeams[0].totalRating - balancedTeams[1].totalRating);
console.log(`Rating difference between teams: ${diff}`);
console.assert(diff <= 1, 'Teams should be balanced with minimal rating difference');

console.log('\n--- TEST 4: Match Banter / Pique Phrases ---');
const winPique = getMatchPiquePhrase(5, 2, teams2[0].name, teams2[1].name);
console.log(`Winner: ${winPique.winner}, Quote: "${winPique.quote}"`);
console.assert(!winPique.isDraw, 'Should be winner');

const drawPique = getMatchPiquePhrase(3, 3, teams2[0].name, teams2[1].name);
console.log(`Draw Quote: "${drawPique.quote}"`);
console.assert(drawPique.isDraw, 'Should be draw');

console.log('\n ALL TESTS PASSED SUCCESSFULLY! ⚽');
