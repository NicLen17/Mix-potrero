import html2canvas from 'html2canvas';
import { getMatchPiquePhrase } from './team-names.js';

/**
 * Formats current date in Spanish (e.g. "Domingo, 18 de Agosto de 2026")
 * @returns {string}
 */
export function getFormattedDate() {
  const date = new Date();
  const options = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  const formatted = date.toLocaleDateString('es-AR', options);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/**
 * Builds the HTML markup for the match summary card
 * @param {Object} team1 
 * @param {Object} team2 
 * @param {number} score1 
 * @param {number} score2 
 * @param {Object} piqueData 
 * @returns {string}
 */
export function buildSummaryCardHtml(team1, team2, score1, score2, piqueData) {
  const dateStr = getFormattedDate();

  const renderPlayerList = (players) => {
    return players
      .map((p, idx) => `
        <div class="summary-player-item">
          <span class="summary-player-num">${idx + 1}</span>
          <span class="summary-player-name">${p.name}</span>
        </div>
      `)
      .join('');
  };

  const isT1Winner = score1 > score2;
  const isT2Winner = score2 > score1;

  return `
    <div id="summary-export-node" class="summary-card-canvas">
      <!-- Background elements -->
      <div class="summary-glow-top"></div>
      <div class="summary-glow-bottom"></div>
      <div class="summary-grid-pattern"></div>

      <!-- Header -->
      <div class="summary-header">
        <div class="summary-logo-row">
          <span class="summary-ball-icon">⚽</span>
          <h1 class="summary-brand-title">MIX-POTRERO</h1>
          <span class="summary-ball-icon">⚽</span>
        </div>
        <div class="summary-date-tag">📅 ${dateStr}</div>
      </div>

      <!-- Scoreboard Section -->
      <div class="summary-scoreboard">
        <!-- Team 1 -->
        <div class="summary-team-box ${isT1Winner ? 'winner-box' : ''}">
          ${isT1Winner ? '<span class="summary-crown">👑 GANADOR</span>' : ''}
          <h2 class="summary-team-title">${team1.name}</h2>
          <div class="summary-score-digit">${score1}</div>
        </div>

        <div class="summary-vs-divider">
          <span class="summary-vs-text">VS</span>
          <div class="summary-vs-line"></div>
        </div>

        <!-- Team 2 -->
        <div class="summary-team-box ${isT2Winner ? 'winner-box' : ''}">
          ${isT2Winner ? '<span class="summary-crown">👑 GANADOR</span>' : ''}
          <h2 class="summary-team-title">${team2.name}</h2>
          <div class="summary-score-digit">${score2}</div>
        </div>
      </div>

      <!-- Banter / Pique Phrase Banner -->
      <div class="summary-pique-box">
        <div class="summary-pique-tag">🔥 FRASE DEL VESTUARIO</div>
        <p class="summary-pique-quote">"${piqueData.quote}"</p>
      </div>

      <!-- Rosters Grid -->
      <div class="summary-rosters-grid">
        <div class="summary-roster-col">
          <div class="summary-roster-header">
            <span class="summary-roster-badge" style="background: ${team1.theme?.primary || '#f59e0b'}"></span>
            <h3>${team1.name} (${team1.players.length})</h3>
          </div>
          <div class="summary-roster-list">
            ${renderPlayerList(team1.players)}
          </div>
        </div>

        <div class="summary-roster-col">
          <div class="summary-roster-header">
            <span class="summary-roster-badge" style="background: ${team2.theme?.primary || '#38bdf8'}"></span>
            <h3>${team2.name} (${team2.players.length})</h3>
          </div>
          <div class="summary-roster-list">
            ${renderPlayerList(team2.players)}
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="summary-footer">
        <span>⚡ mix-potrero.app • El armado definitivo de equipos</span>
      </div>
    </div>
  `;
}

/**
 * Renders and downloads the match summary image
 * @param {Object} team1 
 * @param {Object} team2 
 * @param {number} score1 
 * @param {number} score2 
 * @returns {Promise<{ blob: Blob, dataUrl: string, filename: string }>}
 */
export async function generateAndDownloadSummary(team1, team2, score1, score2) {
  const piqueData = getMatchPiquePhrase(score1, score2, team1.name, team2.name);

  // Create temporary container
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'fixed';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '0';
  tempContainer.style.width = '750px';
  tempContainer.style.zIndex = '-1000';
  tempContainer.innerHTML = buildSummaryCardHtml(team1, team2, score1, score2, piqueData);

  document.body.appendChild(tempContainer);

  const targetNode = tempContainer.querySelector('#summary-export-node');

  try {
    // Wait for fonts to be ready
    if (document.fonts) {
      await document.fonts.ready;
    }

    const canvas = await html2canvas(targetNode, {
      scale: 2, // High resolution (2x retina quality)
      useCORS: true,
      backgroundColor: '#0a1a0f',
      logging: false,
      width: 750,
      windowWidth: 750
    });

    const dataUrl = canvas.toDataURL('image/png');
    const sanitizedT1 = team1.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const sanitizedT2 = team2.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const filename = `mix-potrero-${sanitizedT1}-vs-${sanitizedT2}.png`;

    // Trigger download
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve({
          dataUrl,
          blob,
          filename,
          piqueData,
          team1,
          team2,
          score1,
          score2
        });
      }, 'image/png');
    });
  } finally {
    document.body.removeChild(tempContainer);
  }
}
