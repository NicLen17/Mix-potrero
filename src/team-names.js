// Pool of Argentine potrero team names and banter quotes

export const ARGENTINE_TEAM_NAMES = [
  "Los Picantes de la 5",
  "La Scaloneta de Barrio",
  "Sacachispas del Conurbano",
  "Los Pecho Frío",
  "Deportivo Birra",
  "Los Caños FC",
  "La 12 del Potrero",
  "Los Pibes del Campito",
  "Aston Birra",
  "Real Asado",
  "Los Mufa",
  "Los Patadura FC",
  "Los Magos del Asfalto",
  "Club Atlético Parrilla",
  "La Pesada del Gol",
  "Los Fusileros del Fondo",
  "Los Tiki-Taka",
  "Deportivo Quinto Pelotazo",
  "Los Rompe-Tibia",
  "La Rabona de Oro",
  "Los Craks del Barro",
  "Los Dueños de la Cancha",
  "Inter de Villa",
  "Los Gambeteadores",
  "Los Cañoneros",
  "Racing de Potrero",
  "Los Galácticos de la Plaza",
  "La Jauría FC",
  "Los Pibes del Travesaño",
  "Los Guapos del Área",
  "Deportivo Tercer Tiempo",
  "Los Toco y Me Voy",
  "Los Cabeceadores de Espaldas",
  "La Máquina del Pasto",
  "Los Tiratiros",
  "Botines Rotos FC",
  "Los Reyes del Asador",
  "La Banda del Diez",
  "Los Inoxidables",
  "Los Imparables del Fulbito",
  "El Equipo del Amor Propio",
  "Los Pincharratas",
  "Los Matadores de la Línea",
  "La Muralla del Fondo",
  "Los Francotiradores",
  "Los Gambeta Brava",
  "Los Gladiadores del 5",
  "La Leyenda Continúa",
  "Los Come-Pasto",
  "Los Cracks sin Suerte"
];

export const WINNER_QUOTES = [
  "Les faltó cancha, pibes. Vayan a jugar al metegol 🎯",
  "El asado y las birras las pagan ustedes 🥩🍻",
  "Se fueron con la canasta llena. ¡A practicar a la plaza! 🧺⚽",
  "¿Eso fue un partido o una práctica a puertas cerradas? 🚪😎",
  "Tráiganle un mapa al 5 que todavía está buscando la pelota 🗺️⚽",
  "Más fácil que tabla del uno. La próxima traigan refuerzos 🎓⚡",
  "Hoy les dimos cátedra de potrero y corazón ⚽🔥",
  "Guarden la foto del resultado que este baile no se repite... o sí 😏",
  "Pongan hielo que les va a arder toda la semana 🧊🥶",
  "Un minuto de silencio para el rival que se quedó sin piernas 🤫🪦",
  "Mucho humo en la previa y poco fútbol en la cancha 💨⚽",
  "La gloria es para los que la juegan, no para los que la miran 👑🏆",
  "Les dimos ventaja y ni así pudieron. A llorar a la iglesia ⛪😭",
  "Pegaron más de lo que jugaron, pero los goles los hicimos nosotros 🦵⚽",
  "El vestuario está de fiesta y la cuenta es de ustedes 🥳🎉"
];

export const DRAW_QUOTES = [
  "Partido chivo: se define el ganador en la parrilla 🥩🔥",
  "Empate con sabor a poco... ¡las birras se pagan a medias! 🍻🤝",
  "Pusieron el micro en el arco y no entró ni el aire 🚌⚽",
  "Faltó fútbol pero sobró patada y garra potrera 🦵🔥",
  "Nadie ganó, pero todos nos ganamos una buena milanesa 🥖🥩",
  "La revancha es obligatoria, acá no quedó nada cerrado ⚔️💥",
  "Empate de barrio: mucha corrida, poco gol y todos cansados 🏃‍♂️😮‍💨"
];

/**
 * Returns N unique random team names
 * @param {number} count 
 * @returns {string[]}
 */
export function getRandomTeamNames(count = 2) {
  const shuffled = [...ARGENTINE_TEAM_NAMES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Returns a funny Argentine quote based on match score
 * @param {number} score1 
 * @param {number} score2 
 * @param {string} team1 
 * @param {string} team2 
 * @returns {{ winner: string, loser: string, isDraw: boolean, quote: string }}
 */
export function getMatchPiquePhrase(score1, score2, team1, team2) {
  if (score1 === score2) {
    const quote = DRAW_QUOTES[Math.floor(Math.random() * DRAW_QUOTES.length)];
    return {
      winner: 'Empate',
      loser: 'Nadie',
      isDraw: true,
      quote
    };
  }

  const team1Won = score1 > score2;
  const winner = team1Won ? team1 : team2;
  const loser = team1Won ? team2 : team1;
  const quote = WINNER_QUOTES[Math.floor(Math.random() * WINNER_QUOTES.length)];

  return {
    winner,
    loser,
    isDraw: false,
    quote
  };
}
