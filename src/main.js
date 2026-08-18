import confetti from 'canvas-confetti';
import { parsePlayerList } from './parser.js';
import { generateTeams } from './team-generator.js';
import { storage } from './storage.js';
import { generateAndDownloadSummary } from './summary.js';
import { getTutorialHtml, EXAMPLE_PLAYERS_LIST } from './tutorial.js';

// ==========================================
// Application State
// ==========================================
const state = {
  rawText: '',
  players: [],
  teamCount: 2,
  crackMode: false,
  generatedTeams: null,
  lastSummaryData: null,
  currentView: 'setup', // 'setup' | 'teams' | 'summary' | 'tutorial'
  
  // Captains Sorteo state
  captain1: null,
  captain2: null,
  coinFlipping: false,
  
  // Vaquita state
  pitchCost: 0,
  paymentsMap: {} // { 'player_id_or_name': boolean }
};

// ==========================================
// DOM Elements
// ==========================================
const elements = {
  // Views
  setupView: document.getElementById('setup-view'),
  teamsView: document.getElementById('teams-view'),
  summaryView: document.getElementById('summary-view'),
  tutorialView: document.getElementById('tutorial-view'),

  // Setup View Controls
  playersInput: document.getElementById('players-input'),
  playerCountBadge: document.getElementById('player-count-badge'),
  btnClearInput: document.getElementById('btn-clear-input'),
  teamButtons: document.querySelectorAll('.team-btn'),
  crackModeContainer: document.getElementById('crack-mode-container'),
  crackModeSwitch: document.getElementById('crack-mode-switch'),
  crackRatingsPanel: document.getElementById('crack-ratings-panel'),
  crackPlayersContainer: document.getElementById('crack-players-container'),
  btnGenerateTeams: document.getElementById('btn-generate-teams'),
  btnDrawCaptains: document.getElementById('btn-draw-captains'),

  // Captains Modal Controls
  captainsModal: document.getElementById('captains-modal'),
  btnCloseCaptainsModal: document.getElementById('btn-close-captains-modal'),
  captain1Name: document.getElementById('captain-1-name'),
  captain2Name: document.getElementById('captain-2-name'),
  coin: document.getElementById('coin'),
  coinResultText: document.getElementById('coin-result-text'),
  btnFlipCoin: document.getElementById('btn-flip-coin'),

  // Teams View Controls
  teamsCardsGrid: document.getElementById('teams-cards-grid'),
  btnBackSetup: document.getElementById('btn-back-setup'),
  btnReShuffle: document.getElementById('btn-re-shuffle'),
  btnCopyWhatsapp: document.getElementById('btn-copy-whatsapp'),
  matchScoreSection: document.getElementById('match-score-section'),
  scoreTeam1Name: document.getElementById('score-team-1-name'),
  scoreTeam2Name: document.getElementById('score-team-2-name'),
  inputScore1: document.getElementById('input-score-1'),
  inputScore2: document.getElementById('input-score-2'),
  btnShareSummary: document.getElementById('btn-share-summary'),

  // Vaquita Controls
  vaquitaProgressBadge: document.getElementById('vaquita-progress-badge'),
  pitchCostInput: document.getElementById('pitch-cost-input'),
  pricePerHead: document.getElementById('price-per-head'),
  vaquitaPlayersContainer: document.getElementById('vaquita-players-container'),
  btnCopyVaquitaWhatsapp: document.getElementById('btn-copy-vaquita-whatsapp'),

  // Summary View Controls
  summaryImageContainer: document.getElementById('summary-image-container'),
  btnSummaryBackTeams: document.getElementById('btn-summary-back-teams'),
  btnSummaryRematch: document.getElementById('btn-summary-rematch'),
  btnDownloadAgain: document.getElementById('btn-download-again'),
  btnShareNative: document.getElementById('btn-share-native'),

  // Global & Toast
  toast: document.getElementById('toast'),
  toastIcon: document.getElementById('toast-icon'),
  toastText: document.getElementById('toast-text')
};

// ==========================================
// Toast Notification Helper
// ==========================================
let toastTimeout = null;
export function showToast(message, icon = '⚽', duration = 3000) {
  if (toastTimeout) clearTimeout(toastTimeout);
  elements.toastIcon.textContent = icon;
  elements.toastText.textContent = message;
  elements.toast.classList.add('show');

  toastTimeout = setTimeout(() => {
    elements.toast.classList.remove('show');
  }, duration);
}

// ==========================================
// Navigation & Views Router
// ==========================================
function setView(viewName) {
  state.currentView = viewName;

  elements.setupView.style.display = viewName === 'setup' ? 'block' : 'none';
  elements.teamsView.style.display = viewName === 'teams' ? 'block' : 'none';
  elements.summaryView.style.display = viewName === 'summary' ? 'block' : 'none';
  elements.tutorialView.style.display = viewName === 'tutorial' ? 'block' : 'none';

  if (viewName === 'tutorial') {
    renderTutorial();
  } else if (viewName === 'summary') {
    renderSummaryView();
  } else if (viewName === 'teams') {
    renderVaquita();
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleHashChange() {
  const hash = window.location.hash || '#/';
  if (hash === '#/tutorial') {
    setView('tutorial');
  } else if (hash === '#/summary' && state.lastSummaryData) {
    setView('summary');
  } else if (hash === '#/teams' && state.generatedTeams && state.generatedTeams.length > 0) {
    setView('teams');
  } else {
    setView('setup');
  }
}

// ==========================================
// Live Player Parsing & Crack Mode Panel
// ==========================================
function updatePlayerList() {
  const text = elements.playersInput.value;
  state.rawText = text;
  storage.setRawPlayers(text);

  state.players = parsePlayerList(text);
  const count = state.players.length;

  // Update badge text
  if (count === 0) {
    elements.playerCountBadge.textContent = '0 jugadores';
  } else if (count === 1) {
    elements.playerCountBadge.textContent = '1 jugador';
  } else {
    elements.playerCountBadge.textContent = `${count} jugadores`;
  }

  // Validate generate button
  elements.btnGenerateTeams.disabled = count < state.teamCount;
  if (elements.btnDrawCaptains) {
    elements.btnDrawCaptains.disabled = count < 2;
  }

  // Render crack ratings if mode is active
  if (state.crackMode) {
    renderCrackRatings();
  }
}

function renderCrackRatings() {
  if (!state.players || state.players.length === 0) {
    elements.crackPlayersContainer.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 14px; font-size: 0.9rem;">
        Pegá jugadores arriba para calificar su nivel.
      </div>
    `;
    return;
  }

  elements.crackPlayersContainer.innerHTML = state.players
    .map((player) => {
      const starsHtml = [1, 2, 3, 4, 5]
        .map(
          (starVal) => `
          <button 
            type="button" 
            class="star-btn ${starVal <= player.rating ? 'active' : ''}" 
            data-player-id="${player.id}" 
            data-rating="${starVal}"
            title="${starVal} estrellas"
          >★</button>
        `
        )
        .join('');

      return `
        <div class="player-rating-row" data-player-id="${player.id}">
          <span class="player-rating-name">${player.name}</span>
          <div class="rating-stars">
            ${starsHtml}
          </div>
        </div>
      `;
    })
    .join('');

  // Add click listeners to stars
  elements.crackPlayersContainer.querySelectorAll('.star-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pId = btn.getAttribute('data-player-id');
      const rating = parseInt(btn.getAttribute('data-rating'), 10);
      const targetPlayer = state.players.find((p) => p.id === pId);

      if (targetPlayer) {
        targetPlayer.rating = rating;
        storage.setPlayerRating(targetPlayer.baseName, rating);

        // Update star styles for this row
        const row = btn.closest('.player-rating-row');
        row.querySelectorAll('.star-btn').forEach((sBtn) => {
          const sVal = parseInt(sBtn.getAttribute('data-rating'), 10);
          if (sVal <= rating) {
            sBtn.classList.add('active');
          } else {
            sBtn.classList.remove('active');
          }
        });

        // Trigger light haptic if supported
        if (navigator.vibrate) navigator.vibrate(15);
      }
    });
  });
}

// ==========================================
// Captains Sorteo & Coin Flip
// ==========================================
function openCaptainsModal() {
  if (state.players.length < 2) {
    showToast('Necesitás al menos 2 jugadores para el sorteo', '⚠️');
    return;
  }

  let candidates = [...state.players];

  if (state.crackMode) {
    // Sort by rating descending
    candidates.sort((a, b) => (b.rating || 3) - (a.rating || 3));
    state.captain1 = candidates[0];
    state.captain2 = candidates[1];
  } else {
    // Pick 2 at random
    const shuffled = candidates.sort(() => 0.5 - Math.random());
    state.captain1 = shuffled[0];
    state.captain2 = shuffled[1];
  }

  elements.captain1Name.textContent = state.captain1.name;
  elements.captain2Name.textContent = state.captain2.name;

  // Reset UI
  elements.coin.style.transform = 'rotateY(0deg)';
  elements.coinResultText.textContent = '¡Presioná para tirar la moneda al aire!';
  document.querySelectorAll('.captain-box').forEach((box) => box.classList.remove('winner'));
  elements.btnFlipCoin.disabled = false;

  elements.captainsModal.style.display = 'flex';
}

function closeCaptainsModal() {
  elements.captainsModal.style.display = 'none';
}

function handleFlipCoin() {
  if (state.coinFlipping) return;
  state.coinFlipping = true;
  elements.btnFlipCoin.disabled = true;

  // Clear previous result
  document.querySelectorAll('.captain-box').forEach((box) => box.classList.remove('winner'));
  elements.coinResultText.textContent = '🪙 La moneda está girando...';

  // Determine winner: 0 = CARA (Captain 1), 1 = CRUZ (Captain 2)
  const isCara = Math.random() < 0.5;
  const turns = 8 + (isCara ? 0 : 0.5); // 8 full spins + half spin if Cruz
  const finalDegree = turns * 360;

  // Apply CSS rotation
  elements.coin.style.transform = `rotateY(${finalDegree}deg)`;

  if (navigator.vibrate) navigator.vibrate([30, 50, 30, 50, 100]);

  setTimeout(() => {
    state.coinFlipping = false;
    elements.btnFlipCoin.disabled = false;

    const winnerCaptain = isCara ? state.captain1 : state.captain2;
    const winnerBoxClass = isCara ? '.captain-1' : '.captain-2';
    const sideText = isCara ? 'CARA 🪙' : 'CRUZ 👑';

    document.querySelector(winnerBoxClass).classList.add('winner');
    elements.coinResultText.innerHTML = `🎉 ¡Salió <strong>${sideText}</strong>! Elige primero: <strong>${winnerCaptain.name}</strong>`;

    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 }
      });
    } catch (e) {
      console.log(e);
    }
  }, 3000);
}

// ==========================================
// Generate & Render Teams
// ==========================================
function executeTeamGeneration() {
  if (state.players.length < state.teamCount) {
    showToast(`Necesitás al menos ${state.teamCount} jugadores`, '⚠️');
    return;
  }

  state.generatedTeams = generateTeams(state.players, state.teamCount, state.crackMode);
  storage.setLastTeams(state.generatedTeams);

  renderTeamsView();
  window.location.hash = '#/teams';

  // Small celebratory confetti
  try {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#f59e0b', '#22c55e', '#ffffff']
    });
  } catch (e) {
    console.log(e);
  }

  showToast('¡Equipos armados con éxito!', '🔥');
}

function renderTeamsView() {
  if (!state.generatedTeams) return;

  const gridClass = `teams-${state.generatedTeams.length}`;
  elements.teamsCardsGrid.className = `teams-grid ${gridClass}`;

  elements.teamsCardsGrid.innerHTML = state.generatedTeams
    .map((team) => {
      const theme = team.theme;
      const playerListHtml = team.players
        .map(
          (p, idx) => `
          <li class="roster-item">
            <div class="roster-player-info">
              <span class="roster-num">${idx + 1}</span>
              <span class="roster-name">${p.name}</span>
            </div>
            ${
              state.crackMode
                ? `<span class="roster-rating" title="Nivel">${'★'.repeat(p.rating || 3)}</span>`
                : ''
            }
          </li>
        `
        )
        .join('');

      return `
        <div class="team-card" style="border-color: ${theme.border}; background: ${theme.gradient}">
          <div class="team-card-header">
            <div class="team-badge-name" style="color: ${theme.accent}">
              ${team.name}
            </div>
            <div class="team-stats-badge">
              ⚽ ${team.players.length} jugadores ${
                state.crackMode ? `• ⭐ ${team.avgRating}` : ''
              }
            </div>
          </div>
          <ul class="team-roster">
            ${playerListHtml}
          </ul>
        </div>
      `;
    })
    .join('');

  // Configure match score section (only for 2 teams)
  if (state.generatedTeams.length === 2) {
    elements.matchScoreSection.style.display = 'block';
    elements.scoreTeam1Name.textContent = state.generatedTeams[0].name;
    elements.scoreTeam2Name.textContent = state.generatedTeams[1].name;
    elements.inputScore1.value = '';
    elements.inputScore2.value = '';
  } else {
    elements.matchScoreSection.style.display = 'none';
  }

  // Render Vaquita Payment Section
  renderVaquita();
}

// ==========================================
// La Vaquita (Organizador de Pago)
// ==========================================
function renderVaquita() {
  state.pitchCost = storage.getPitchCost();
  state.paymentsMap = storage.getPayments();

  if (elements.pitchCostInput) {
    elements.pitchCostInput.value = state.pitchCost > 0 ? state.pitchCost : '';
  }

  // Determine current active player list
  let activePlayers = state.players;
  if (!activePlayers || activePlayers.length === 0) {
    if (state.generatedTeams) {
      activePlayers = state.generatedTeams.flatMap((t) => t.players);
    }
  }

  const totalPlayers = activePlayers.length;

  if (totalPlayers === 0) {
    elements.pricePerHead.textContent = '$0';
    elements.vaquitaProgressBadge.textContent = '0/0 Pagaron';
    elements.vaquitaPlayersContainer.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 12px; font-size: 0.9rem;">
        Cargá una lista de jugadores para calcular los pagos.
      </div>
    `;
    return;
  }

  const perHead = state.pitchCost > 0 ? Math.ceil(state.pitchCost / totalPlayers) : 0;
  elements.pricePerHead.textContent = `$${perHead.toLocaleString('es-AR')}`;

  let paidCount = 0;

  elements.vaquitaPlayersContainer.innerHTML = activePlayers
    .map((p) => {
      const isPaid = Boolean(state.paymentsMap[p.name]);
      if (isPaid) paidCount++;

      return `
        <div class="vaquita-player-row ${isPaid ? 'paid' : ''}" data-player-name="${p.name}">
          <div class="vaquita-left">
            <input type="checkbox" class="vaquita-checkbox" ${isPaid ? 'checked' : ''} />
            <span class="vaquita-name">${p.name}</span>
          </div>
          <span class="vaquita-status-badge ${isPaid ? 'paid' : 'unpaid'}">
            ${isPaid ? '✅ PAGÓ' : '❌ DEBE'}
          </span>
        </div>
      `;
    })
    .join('');

  elements.vaquitaProgressBadge.textContent = `${paidCount}/${totalPlayers} Pagaron`;

  // Attach event listeners to rows/checkboxes
  elements.vaquitaPlayersContainer.querySelectorAll('.vaquita-player-row').forEach((row) => {
    row.addEventListener('click', (e) => {
      const name = row.getAttribute('data-player-name');
      const isCurrentlyPaid = Boolean(state.paymentsMap[name]);
      state.paymentsMap[name] = !isCurrentlyPaid;
      storage.setPayments(state.paymentsMap);

      if (navigator.vibrate) navigator.vibrate(15);
      renderVaquita();
    });
  });
}

function copyVaquitaToWhatsapp() {
  let activePlayers = state.players;
  if (!activePlayers || activePlayers.length === 0) {
    if (state.generatedTeams) {
      activePlayers = state.generatedTeams.flatMap((t) => t.players);
    }
  }

  if (!activePlayers || activePlayers.length === 0) {
    showToast('No hay jugadores para armar la vaquita', '⚠️');
    return;
  }

  const totalPlayers = activePlayers.length;
  const totalCost = state.pitchCost || 0;
  const perHead = totalCost > 0 ? Math.ceil(totalCost / totalPlayers) : 0;

  const paidList = activePlayers.filter((p) => Boolean(state.paymentsMap[p.name]));
  const unpaidList = activePlayers.filter((p) => !Boolean(state.paymentsMap[p.name]));

  let text = `💰 *MIX-POTRERO | LA VAQUITA DE LA CANCHA*\n`;
  text += `💵 Costo Total: $${totalCost.toLocaleString('es-AR')}\n`;
  text += `👤 Por persona: *$${perHead.toLocaleString('es-AR')}* (${totalPlayers} jugadores)\n\n`;

  if (paidList.length > 0) {
    text += `✅ *PAGARON (${paidList.length}):*\n`;
    paidList.forEach((p) => {
      text += `• ${p.name}\n`;
    });
    text += `\n`;
  }

  if (unpaidList.length > 0) {
    text += `❌ *FALTA COBRAR (${unpaidList.length}):*\n`;
    unpaidList.forEach((p) => {
      text += `• ${p.name}\n`;
    });
    text += `\n`;
  }

  text += `⚡ Armado con mix-potrero.app`;

  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showToast('Lista de cobro copiada', '📋');
      })
      .catch(() => {
        showToast('Error al copiar la lista', '❌');
      });
  }
}

// ==========================================
// Copy to WhatsApp
// ==========================================
function copyTeamsToWhatsapp() {
  if (!state.generatedTeams) return;

  const dateStr = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  let text = `⚽ *MIX-POTRERO | EQUIPOS ARMADOS*\n📅 ${dateStr.toUpperCase()}\n\n`;

  state.generatedTeams.forEach((team) => {
    text += `🔥 *${team.name.toUpperCase()}* (${team.players.length} jugadores)\n`;
    team.players.forEach((p, idx) => {
      text += `${idx + 1}. ${p.name}\n`;
    });
    text += `\n`;
  });

  text += `⚡ Armado con mix-potrero.app`;

  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showToast('Equipos copiados', '📋');
      })
      .catch(() => {
        showToast('Error al copiar equipos', '❌');
      });
  } else {
    showToast('Portapapeles no disponible', '⚠️');
  }
}

// ==========================================
// Match Summary Image Generation & Dedicated View
// ==========================================
async function handleShareSummary() {
  if (!state.generatedTeams || state.generatedTeams.length !== 2) return;

  const score1 = parseInt(elements.inputScore1.value, 10) || 0;
  const score2 = parseInt(elements.inputScore2.value, 10) || 0;

  elements.btnShareSummary.disabled = true;

  try {
    const result = await generateAndDownloadSummary(
      state.generatedTeams[0],
      state.generatedTeams[1],
      score1,
      score2
    );

    state.lastSummaryData = result;

    // Confetti on win
    if (score1 !== score2) {
      confetti({
        particleCount: 70,
        spread: 65,
        origin: { y: 0.6 }
      });
    }

    // Toast: only "Resumen listo"
    showToast('Resumen listo', '✅');

    // Automatic redirect to dedicated summary view
    window.location.hash = '#/summary';
  } catch (err) {
    console.error('Error generating summary:', err);
    showToast('Error al generar imagen', '❌');
  } finally {
    elements.btnShareSummary.disabled = false;
  }
}

function renderSummaryView() {
  if (!state.lastSummaryData) {
    window.location.hash = '#/teams';
    return;
  }

  elements.summaryImageContainer.innerHTML = `
    <img src="${state.lastSummaryData.dataUrl}" alt="Resumen del Partido" />
  `;
}

// ==========================================
// Tutorial View Renderer
// ==========================================
function renderTutorial() {
  elements.tutorialView.innerHTML = getTutorialHtml();

  const btnLoadExample = document.getElementById('btn-load-example');
  if (btnLoadExample) {
    btnLoadExample.addEventListener('click', () => {
      elements.playersInput.value = EXAMPLE_PLAYERS_LIST;
      updatePlayerList();
      showToast('Lista de ejemplo cargada', '⚽');
      window.location.hash = '#/';
    });
  }
}

// ==========================================
// Initialize App & Event Listeners
// ==========================================
function init() {
  // Restore saved state from storage
  const savedText = storage.getRawPlayers();
  if (savedText) {
    elements.playersInput.value = savedText;
  }

  const savedCount = storage.getTeamCount();
  state.teamCount = savedCount;
  elements.teamButtons.forEach((btn) => {
    const num = parseInt(btn.getAttribute('data-teams'), 10);
    if (num === savedCount) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const savedCrackMode = storage.getCrackMode();
  state.crackMode = savedCrackMode;
  elements.crackModeSwitch.checked = savedCrackMode;
  elements.crackRatingsPanel.style.display = savedCrackMode ? 'block' : 'none';

  // Initial parse
  updatePlayerList();

  // Restore last teams if available
  const lastTeams = storage.getLastTeams();
  if (lastTeams && lastTeams.length > 0) {
    state.generatedTeams = lastTeams;
  }

  // Bind Input events
  elements.playersInput.addEventListener('input', updatePlayerList);

  elements.btnClearInput.addEventListener('click', () => {
    if (elements.playersInput.value.trim().length > 0) {
      if (confirm('¿Querés borrar la lista de jugadores?')) {
        elements.playersInput.value = '';
        storage.clearData();
        updatePlayerList();
        showToast('Lista borrada', '🗑️');
      }
    }
  });

  // Team Selector Toggle
  elements.teamButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      elements.teamButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const count = parseInt(btn.getAttribute('data-teams'), 10);
      state.teamCount = count;
      storage.setTeamCount(count);
      updatePlayerList();
    });
  });

  // Crack Mode Toggle
  elements.crackModeContainer.addEventListener('click', () => {
    elements.crackModeSwitch.checked = !elements.crackModeSwitch.checked;
    state.crackMode = elements.crackModeSwitch.checked;
    storage.setCrackMode(state.crackMode);
    elements.crackRatingsPanel.style.display = state.crackMode ? 'block' : 'none';
    if (state.crackMode) {
      renderCrackRatings();
    }
  });

  elements.crackModeSwitch.addEventListener('change', (e) => {
    state.crackMode = e.target.checked;
    storage.setCrackMode(state.crackMode);
    elements.crackRatingsPanel.style.display = state.crackMode ? 'block' : 'none';
    if (state.crackMode) {
      renderCrackRatings();
    }
  });

  // Captains Modal Listeners
  if (elements.btnDrawCaptains) {
    elements.btnDrawCaptains.addEventListener('click', openCaptainsModal);
  }
  if (elements.btnCloseCaptainsModal) {
    elements.btnCloseCaptainsModal.addEventListener('click', closeCaptainsModal);
  }
  if (elements.btnFlipCoin) {
    elements.btnFlipCoin.addEventListener('click', handleFlipCoin);
  }

  // Vaquita Listeners
  if (elements.pitchCostInput) {
    elements.pitchCostInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10) || 0;
      state.pitchCost = val;
      storage.setPitchCost(val);
      renderVaquita();
    });
  }
  if (elements.btnCopyVaquitaWhatsapp) {
    elements.btnCopyVaquitaWhatsapp.addEventListener('click', copyVaquitaToWhatsapp);
  }

  // Action Buttons
  elements.btnGenerateTeams.addEventListener('click', executeTeamGeneration);
  elements.btnReShuffle.addEventListener('click', executeTeamGeneration);
  elements.btnBackSetup.addEventListener('click', () => {
    window.location.hash = '#/';
  });
  elements.btnCopyWhatsapp.addEventListener('click', copyTeamsToWhatsapp);
  elements.btnShareSummary.addEventListener('click', handleShareSummary);

  // Summary View Buttons
  elements.btnSummaryBackTeams.addEventListener('click', () => {
    window.location.hash = '#/teams';
  });

  elements.btnSummaryRematch.addEventListener('click', () => {
    window.location.hash = '#/';
  });

  elements.btnDownloadAgain.addEventListener('click', () => {
    if (state.lastSummaryData) {
      const link = document.createElement('a');
      link.download = state.lastSummaryData.filename;
      link.href = state.lastSummaryData.dataUrl;
      link.click();
      showToast('Descargando imagen...', '📥');
    }
  });

  elements.btnShareNative.addEventListener('click', async () => {
    if (state.lastSummaryData) {
      const { blob, filename, piqueData, team1, team2, score1, score2 } = state.lastSummaryData;
      if (blob && navigator.canShare) {
        const file = new File([blob], filename, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: `Resultado: ${team1.name} ${score1} - ${score2} ${team2.name}`,
              text: `⚽ Resumen: "${piqueData.quote}"`
            });
            return;
          } catch (e) {
            console.log('Share dismissed:', e);
          }
        }
      }

      // Fallback: Copy match text and trigger download
      const shareText = `⚽ *RESULTADO DEL PARTIDO*\n🔥 ${team1.name}: ${score1}\n⚡ ${team2.name}: ${score2}\n\n💬 "${piqueData.quote}"\n\n⚡ Armado con mix-potrero.app`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText);
        showToast('Texto copiado para WhatsApp', '📋');
      }
    }
  });

  // Router Listeners
  window.addEventListener('hashchange', handleHashChange);
  handleHashChange();

  // Register PWA Service Worker
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('PWA Service Worker registered:', reg.scope))
        .catch((err) => console.log('Service Worker registration failed:', err));
    });
  }
}

// Start app
document.addEventListener('DOMContentLoaded', init);
