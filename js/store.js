/**
 * Couche de persistance du prototype.
 * En l'absence de serveur, l'état de l'application est stocké dans le
 * localStorage du navigateur. Une vraie mise en production remplacerait
 * ce module par des appels à une API (authentification SSO, base de
 * données, stockage vidéo sur un serveur média).
 */

const STORAGE_KEYS = {
  users: 'tnh_users',
  session: 'tnh_session',
  tools: 'tnh_tools',
  tutorials: 'tnh_tutorials',
  progress: 'tnh_progress'
};

const Store = {
  _read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.warn('Lecture localStorage impossible pour', key, e);
      return fallback;
    }
  },
  _write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.users)) {
      this._write(STORAGE_KEYS.users, DEMO_USERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.tools)) {
      this._write(STORAGE_KEYS.tools, TOOLS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.tutorials)) {
      this._write(STORAGE_KEYS.tutorials, SEED_TUTORIALS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.progress)) {
      this._write(STORAGE_KEYS.progress, {});
    }
  },

  getUsers() { return this._read(STORAGE_KEYS.users, []); },
  saveUsers(users) { this._write(STORAGE_KEYS.users, users); },

  getTools() { return this._read(STORAGE_KEYS.tools, []); },
  saveTools(tools) { this._write(STORAGE_KEYS.tools, tools); },

  getTutorials() { return this._read(STORAGE_KEYS.tutorials, []); },
  saveTutorials(list) { this._write(STORAGE_KEYS.tutorials, list); },

  getProgress() { return this._read(STORAGE_KEYS.progress, {}); },
  saveProgress(p) { this._write(STORAGE_KEYS.progress, p); },

  getSessionUserId() { return localStorage.getItem(STORAGE_KEYS.session); },
  setSessionUserId(id) {
    if (id) localStorage.setItem(STORAGE_KEYS.session, id);
    else localStorage.removeItem(STORAGE_KEYS.session);
  },

  getCurrentUser() {
    const id = this.getSessionUserId();
    if (!id) return null;
    return this.getUsers().find(u => u.id === id) || null;
  },

  getToolProgress(userId, toolId) {
    const tutorials = this.getTutorials().filter(t => t.toolId === toolId);
    const progress = this.getProgress()[userId] || {};
    const watched = tutorials.filter(t => progress[t.id] && progress[t.id].watched).length;
    return { total: tutorials.length, watched };
  },

  markWatched(userId, tutorialId, watched) {
    const progress = this.getProgress();
    if (!progress[userId]) progress[userId] = {};
    if (!progress[userId][tutorialId]) progress[userId][tutorialId] = {};
    progress[userId][tutorialId].watched = watched;
    progress[userId][tutorialId].updatedAt = Date.now();
    this.saveProgress(progress);
  },

  setPosition(userId, tutorialId, seconds) {
    const progress = this.getProgress();
    if (!progress[userId]) progress[userId] = {};
    if (!progress[userId][tutorialId]) progress[userId][tutorialId] = {};
    progress[userId][tutorialId].lastPositionSec = seconds;
    progress[userId][tutorialId].updatedAt = Date.now();
    this.saveProgress(progress);
  }
};
