// LocalStorage management for Mix-Potrero
const STORAGE_KEYS = {
  RAW_PLAYERS: 'mix_potrero_raw_players',
  PLAYER_RATINGS: 'mix_potrero_ratings',
  CRACK_MODE: 'mix_potrero_crack_mode',
  TEAM_COUNT: 'mix_potrero_team_count',
  LAST_TEAMS: 'mix_potrero_last_teams',
  MATCH_HISTORY: 'mix_potrero_history',
  PITCH_COST: 'mix_potrero_pitch_cost',
  PAYMENTS: 'mix_potrero_payments'
};

export const storage = {
  getRawPlayers() {
    try {
      return localStorage.getItem(STORAGE_KEYS.RAW_PLAYERS) || '';
    } catch {
      return '';
    }
  },

  setRawPlayers(text) {
    try {
      localStorage.setItem(STORAGE_KEYS.RAW_PLAYERS, text);
    } catch (e) {
      console.warn('Error saving raw players to localStorage', e);
    }
  },

  getPlayerRatings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLAYER_RATINGS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  setPlayerRating(playerName, rating) {
    try {
      const ratings = this.getPlayerRatings();
      ratings[playerName.toLowerCase().trim()] = Number(rating);
      localStorage.setItem(STORAGE_KEYS.PLAYER_RATINGS, JSON.stringify(ratings));
    } catch (e) {
      console.warn('Error saving rating', e);
    }
  },

  getCrackMode() {
    try {
      return localStorage.getItem(STORAGE_KEYS.CRACK_MODE) === 'true';
    } catch {
      return false;
    }
  },

  setCrackMode(isEnabled) {
    try {
      localStorage.setItem(STORAGE_KEYS.CRACK_MODE, String(isEnabled));
    } catch (e) {
      console.warn('Error saving crack mode', e);
    }
  },

  getTeamCount() {
    try {
      const count = parseInt(localStorage.getItem(STORAGE_KEYS.TEAM_COUNT), 10);
      return count >= 2 && count <= 4 ? count : 2;
    } catch {
      return 2;
    }
  },

  setTeamCount(count) {
    try {
      localStorage.setItem(STORAGE_KEYS.TEAM_COUNT, String(count));
    } catch (e) {
      console.warn('Error saving team count', e);
    }
  },

  getLastTeams() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAST_TEAMS);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setLastTeams(teams) {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_TEAMS, JSON.stringify(teams));
    } catch (e) {
      console.warn('Error saving last teams', e);
    }
  },

  getPitchCost() {
    try {
      const cost = localStorage.getItem(STORAGE_KEYS.PITCH_COST);
      return cost ? parseInt(cost, 10) : 0;
    } catch {
      return 0;
    }
  },

  setPitchCost(cost) {
    try {
      localStorage.setItem(STORAGE_KEYS.PITCH_COST, String(cost));
    } catch (e) {
      console.warn('Error saving pitch cost', e);
    }
  },

  getPayments() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  setPayments(paymentsMap) {
    try {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(paymentsMap));
    } catch (e) {
      console.warn('Error saving payments', e);
    }
  },

  clearData() {
    try {
      localStorage.removeItem(STORAGE_KEYS.RAW_PLAYERS);
      localStorage.removeItem(STORAGE_KEYS.LAST_TEAMS);
      localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    } catch (e) {
      console.warn('Error clearing storage', e);
    }
  }
};
