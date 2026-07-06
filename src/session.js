/**
 * session.js — Celebrity Bingo Online Session Manager
 * Uses Firebase Realtime Database for real-time host→player sync.
 *
 * Roles:
 *   host   — creates session, spins wheel, broadcasts draw events
 *   player — joins via code, edits board in lobby, receives draws live
 */

import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  get,
  push,
  update,
  remove,
  onValue,
  off,
  serverTimestamp,
} from 'firebase/database';

// ─── Firebase Config ─────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};


const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Generate a random 6-char uppercase alphanumeric code */
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no O/0/I/1 ambiguity
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/** Generate a simple unique player ID stored in localStorage */
function getOrCreatePlayerId() {
  let id = localStorage.getItem('bingo_player_id');
  if (!id) {
    id = 'p_' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('bingo_player_id', id);
  }
  return id;
}

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ─── Module State ─────────────────────────────────────────────────────────────

/** Internal session state — not exported directly, accessed via getters */
const _session = {
  active: false,
  code: null,
  role: null,       // 'host' | 'player'
  playerId: null,
  nickname: null,
  listeners: [],    // [{ ref, callback }] — for cleanup
};

// ─── Private: listener management ─────────────────────────────────────────────

function _listen(dbRef, callback) {
  onValue(dbRef, callback);
  _session.listeners.push({ ref: dbRef, callback });
}

function _stopAllListeners() {
  _session.listeners.forEach(({ ref: r, callback }) => off(r, 'value', callback));
  _session.listeners = [];
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const Session = {
  // ── Getters ────────────────────────────────────────────────────────────────
  get active() { return _session.active; },
  get code() { return _session.code; },
  get role() { return _session.role; },
  get isHost() { return _session.role === 'host'; },
  get isPlayer() { return _session.role === 'player'; },
  get playerId() { return _session.playerId; },

  // ── Host: create a new session ─────────────────────────────────────────────
  /**
   * Creates a new session in Firebase. Returns the session code.
   * @param {string[]} pool — current admin category pool
   */
  async create(pool) {
    let code;
    let attempts = 0;
    // Find an unused code
    do {
      code = generateCode();
      const snap = await get(ref(db, `sessions/${code}`));
      if (!snap.exists()) break;
      attempts++;
    } while (attempts < 10);

    const now = Date.now();
    await set(ref(db, `sessions/${code}`), {
      createdAt: now,
      expiresAt: now + SESSION_TTL_MS,
      gameStarted: false,
      host: {
        pool: pool,
        drawn: [],
        current: null,
      },
      players: {},
    });

    _session.active = true;
    _session.code = code;
    _session.role = 'host';
    _session.playerId = null;
    _session.nickname = 'Host';

    return code;
  },

  // ── Player: join an existing session ───────────────────────────────────────
  /**
   * Validates the code and joins the session as a player.
   * Returns { ok, error, gameStarted }
   */
  async join(code, nickname, currentCells) {
    const upperCode = code.toUpperCase().trim();
    const snap = await get(ref(db, `sessions/${upperCode}`));

    if (!snap.exists()) {
      return { ok: false, error: 'ไม่พบเซสชันนี้ กรุณาตรวจสอบรหัสอีกครั้ง' };
    }

    const data = snap.val();

    if (Date.now() > data.expiresAt) {
      return { ok: false, error: 'เซสชันนี้หมดอายุแล้ว (24 ชั่วโมง)' };
    }

    if (data.gameStarted) {
      return { ok: false, error: 'เกมเริ่มแล้ว ไม่สามารถเข้าร่วมได้ในขณะนี้' };
    }

    const playerId = getOrCreatePlayerId();
    await set(ref(db, `sessions/${upperCode}/players/${playerId}`), {
      nickname: nickname || `ผู้เล่น ${Object.keys(data.players || {}).length + 1}`,
      joinedAt: Date.now(),
      cells: currentCells,
      lastBingoCount: 0,
    });

    _session.active = true;
    _session.code = upperCode;
    _session.role = 'player';
    _session.playerId = playerId;
    _session.nickname = nickname;

    return { ok: true, gameStarted: data.gameStarted };
  },

  // ── Leave / cleanup ────────────────────────────────────────────────────────
  async leave() {
    if (!_session.active) return;
    _stopAllListeners();

    if (_session.role === 'player' && _session.playerId) {
      try {
        await remove(ref(db, `sessions/${_session.code}/players/${_session.playerId}`));
      } catch (_) { /* ignore */ }
    }

    _session.active = false;
    _session.code = null;
    _session.role = null;
    _session.playerId = null;
  },

  // ── Host: broadcast a new draw ─────────────────────────────────────────────
  async broadcastDraw(category, drawn) {
    if (!_session.active || !_session.code) return;
    await update(ref(db, `sessions/${_session.code}/host`), {
      current: category,
      drawn: drawn,
    });
  },

  // ── Host: broadcast reset ──────────────────────────────────────────────────
  async broadcastReset() {
    if (!_session.active || !_session.code) return;
    await update(ref(db, `sessions/${_session.code}/host`), {
      current: null,
      drawn: [],
    });
  },

  // ── Host: sync pool (after Google Sheet sync) ──────────────────────────────
  async syncPool(pool) {
    if (!_session.active || !_session.code) return;
    await update(ref(db, `sessions/${_session.code}/host`), { pool });
  },

  // ── Host: start the game ───────────────────────────────────────────────────
  async startGame() {
    if (!_session.active || !_session.code) return;
    await update(ref(db, `sessions/${_session.code}`), { gameStarted: true });
  },

  // ── Player: update their board cells ──────────────────────────────────────
  async updatePlayerCells(cells) {
    if (!_session.active || !_session.playerId) return;
    await update(ref(db, `sessions/${_session.code}/players/${_session.playerId}`), {
      cells,
    });
  },

  // ── Player: update bingo count ─────────────────────────────────────────────
  async updatePlayerBingo(lastBingoCount) {
    if (!_session.active || !_session.playerId) return;
    await update(ref(db, `sessions/${_session.code}/players/${_session.playerId}`), {
      lastBingoCount,
    });
  },

  // ── Subscribe: host update (for players) ──────────────────────────────────
  /**
   * @param {(hostData: { pool, drawn, current }) => void} cb
   */
  onHostUpdate(cb) {
    if (!_session.active || !_session.code) return;
    const hostRef = ref(db, `sessions/${_session.code}/host`);
    _listen(hostRef, (snap) => {
      if (snap.exists()) cb(snap.val());
    });
  },

  // ── Subscribe: game started (for players) ─────────────────────────────────
  /**
   * @param {() => void} cb — called once when gameStarted flips to true
   */
  onGameStarted(cb) {
    if (!_session.active || !_session.code) return;
    const gameRef = ref(db, `sessions/${_session.code}/gameStarted`);
    _listen(gameRef, (snap) => {
      if (snap.exists() && snap.val() === true) cb();
    });
  },

  // ── Subscribe: player list changes (for host) ─────────────────────────────
  /**
   * @param {(players: Record<string, PlayerData>) => void} cb
   */
  onPlayersChange(cb) {
    if (!_session.active || !_session.code) return;
    const playersRef = ref(db, `sessions/${_session.code}/players`);
    _listen(playersRef, (snap) => {
      cb(snap.exists() ? snap.val() : {});
    });
  },
};
