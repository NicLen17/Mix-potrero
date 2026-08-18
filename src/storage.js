// LocalStorage management for Mix-Potrero
const STORAGE_KEYS = {
  RAW_PLAYERS: 'mix_potrero_raw_players',
  PLAYER_RATINGS: 'mix_potrero_ratings',
  CRACK_MODE: 'mix_potrero_crack_mode',
  TEAM_COUNT: 'mix_potrero_team_count',
  LAST_TEAMS: 'mix_potrero_last_teams',
  MATCH_HISTORY: 'mix_potrero_history'
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

  clearData() {
    try {
      localStorage.removeItem(STORAGE_KEYS.RAW_PLAYERS);
      localStorage.removeItem(STORAGE_KEYS.LAST_TEAMS);
    } catch (e) {
      console.warn('Error clearing storage', e);
    }
  }
};
