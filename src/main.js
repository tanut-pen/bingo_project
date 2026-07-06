/**
 * Celebrity Bingo - Unified main controller (Admin & Player Board)
 * Uses pure Vanilla JavaScript, Tailwind CSS, and Lucide Icons.
 */
import { Session, ensureFirebaseInitialized } from './session.js';

// --- GLOBAL ERROR BOUNDARY ---
window.onerror = function (message, source, lineno, colno, error) {
  console.error("GLOBAL ERROR DETECTED:", message, "at", lineno, ":", colno);
  const errDiv = document.createElement('div');
  errDiv.style.position = 'fixed';
  errDiv.style.bottom = '10px';
  errDiv.style.left = '10px';
  errDiv.style.background = '#ef4444';
  errDiv.style.color = '#ffffff';
  errDiv.style.padding = '14px';
  errDiv.style.borderRadius = '12px';
  errDiv.style.border = '3px solid #1e293b';
  errDiv.style.zIndex = '99999';
  errDiv.style.fontWeight = '900';
  errDiv.style.fontFamily = 'monospace';
  errDiv.style.boxShadow = '4px 4px 0px #1e293b';
  errDiv.textContent = `ERR: ${message} (${lineno}:${colno})`;
  document.body.appendChild(errDiv);
  return false;
};

// --- PRESETS LIST ---
const DEFAULT_CATEGORIES = [
  "คนที่มีบริษัทเป็นของตัวเอง",
  "พิธีกรรายการทีวี",
  "ชื่อตัวเอง",
  "คนที่ผมยาวเกินไหล่",
  "ชื่อตัวร้าย",
  "ชื่อเชฟ",
  "ตัวละครในหนังผี",
  "บุคคลที่อยู่ในหนังสือเรียน",
  "ชื่อตัวการตูนที่เป็นชื่อเดียวกับชื่อเรื่อง",
  "ตัวละครที่มีรอยแผลเป็น",
  "คนที่เคยเดินทางไปต่างประเทศอย่างน้อยสองครั้ง",
  "คนไทย",
  "หัวโล้น",
  "ตัวละครที่มีหนังเกินสามภาค",
  "ชื่อผี",
  "นักแสดงชาวอังกฤษ",
  "คนจีน",
  "คน หรือ ตัวละครที่ใส่เครื่องแบบ",
  "ใส่แว่น",
  "นักกีฬา"
];

const CELEBRITY_NAMES = [
  "Lisa Blackpink", "Jennie Blackpink", "Jisoo Blackpink", "Rosé Blackpink", "IU (Lee Ji-eun)",
  "Taylor Swift", "Beyoncé", "Rihanna", "Ariana Grande", "Billie Eilish",
  "Justin Bieber", "Bruno Mars", "Ed Sheeran", "The Weeknd", "Lady Gaga",
  "Michael Jackson", "Freddie Mercury", "Madonna", "Elvis Presley", "Eminem",
  "Elon Musk", "Bill Gates", "Steve Jobs", "Mark Zuckerberg", "Jeff Bezos",
  "Albert Einstein", "Marie Curie", "Isaac Newton", "Charles Darwin", "Stephen Hawking",
  "Cristiano Ronaldo", "Lionel Messi", "David Beckham", "Kylian Mbappé", "Neymar Jr.",
  "Michael Jordan", "LeBron James", "Stephen Curry", "Kobe Bryant", "Shaquille O'Neal",
  "Robert Downey Jr.", "Scarlett Johansson", "Tom Holland", "Chris Evans", "Chris Hemsworth",
  "Leonardo DiCaprio", "Brad Pitt", "Johnny Depp", "Tom Cruise", "Keanu Reeves",
  "Angelina Jolie", "Margot Robbie", "Zendaya", "Emma Watson", "Natalie Portman",
  "Christopher Nolan", "Steven Spielberg", "Quentin Tarantino", "James Cameron", "Hayao Miyazaki",
  "Gordon Ramsay", "Chef Paom", "Woody Vuthithorn", "Na Nek", "Pimrypie",
  "Sunny Suwanmethanont", "Mario Maurer", "Nadech Kugimiya", "Mark Prin", "Boy Pakorn",
  "Yaya Urassaya", "Bella Ranee", "Baifern Pimchanok", "Kimmy Kimberley", "Chompoo Araya",
  "Bright Vachirawit", "Win Metawin", "Billkin Putthipong", "PP Krit", "Jeff Satur",
  "Nont Tanont", "Ink Waruntorn", "Bowkylion", "Milli", "The Toys",
  "Toon Bodyslam", "Joey Boy", "F.Hero", "Stamp Apiwat", "Peck Palitchoke",
  "Harry Potter", "Lord Voldemort", "Hermione Granger", "Ron Weasley", "Albus Dumbledore",
  "Spider-Man", "Iron Man", "Batman", "Superman", "Joker"
];

// --- AUDIO SYNTHESIS UTILITY ---
class AudioSynth {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle(state) {
    this.enabled = state;
  }

  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(190, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playSpinTick(frequency = 500) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playWin() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const playNote = (freq, start, duration) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

      osc.start(start);
      osc.stop(start + duration);
    };

    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];

    notes.forEach((freq, index) => {
      playNote(freq, now + index * 0.1, 0.25);
    });
  }
}

const audioSynth = new AudioSynth();

// --- STATE MANAGEMENT ---
const state = {
  // Navigation
  activeTab: 'admin', // 'admin' or 'player'

  // Settings
  soundEnabled: false,
  voiceEnabled: false,

  // Admin Pool Settings
  adminPool: [...DEFAULT_CATEGORIES],
  adminDrawn: [],
  adminCurrent: null,
  isSpinning: false,
  spinIndex: 0,
  lastSyncTime: null,

  // Player Grid Settings
  playerCells: Array(25).fill(null).map((_, i) => ({ id: i, name: "", marked: false })),
  playerIsPlayMode: false,
  playerLastBingoCount: 0,

  // Online Session
  sessionGameStarted: false, // true once host starts the game
};

/**
 * Loads both Admin and Player board states from localStorage safely.
 */
function loadState() {
  try {
    state.activeTab = localStorage.getItem('bingo_active_tab') || 'admin';
    state.soundEnabled = localStorage.getItem('bingo_sound_enabled') === 'true';
    state.voiceEnabled = localStorage.getItem('bingo_voice_enabled') === 'true';

    const savedPool = localStorage.getItem('bingo_admin_pool');
    if (savedPool) state.adminPool = JSON.parse(savedPool);

    const savedDrawn = localStorage.getItem('bingo_admin_drawn');
    if (savedDrawn) state.adminDrawn = JSON.parse(savedDrawn);

    const savedCurrent = localStorage.getItem('bingo_admin_current');
    if (savedCurrent) {
      try {
        state.adminCurrent = JSON.parse(savedCurrent);
      } catch {
        state.adminCurrent = savedCurrent;
      }
    }

    state.lastSyncTime = localStorage.getItem('bingo_last_sync_time') || null;

    const savedCells = localStorage.getItem('bingo_player_cells');
    if (savedCells) {
      const parsed = JSON.parse(savedCells);
      if (Array.isArray(parsed) && parsed.length === 25) {
        // Validate each cell element is safe to prevent null reference runtime crashes
        const isValid = parsed.every(c => c && typeof c === 'object' && 'id' in c && 'name' in c && 'marked' in c);
        if (isValid) {
          state.playerCells = parsed;
        }
      }
    }
    state.playerIsPlayMode = localStorage.getItem('bingo_player_playmode') === 'true';
    state.playerLastBingoCount = parseInt(localStorage.getItem('bingo_player_lastbingo') || '0', 10);
  } catch (err) {
    console.error("Error loading state from localStorage, resetting to defaults:", err);
    localStorage.clear();
  }
}

/**
 * Persists both Admin and Player state pools.
 */
function saveState() {
  localStorage.setItem('bingo_active_tab', state.activeTab);
  localStorage.setItem('bingo_sound_enabled', state.soundEnabled ? 'true' : 'false');
  localStorage.setItem('bingo_voice_enabled', state.voiceEnabled ? 'true' : 'false');

  localStorage.setItem('bingo_admin_pool', JSON.stringify(state.adminPool));
  localStorage.setItem('bingo_admin_drawn', JSON.stringify(state.adminDrawn));
  localStorage.setItem('bingo_admin_current', JSON.stringify(state.adminCurrent));
  localStorage.setItem('bingo_last_sync_time', state.lastSyncTime || '');

  localStorage.setItem('bingo_player_cells', JSON.stringify(state.playerCells));
  localStorage.setItem('bingo_player_playmode', state.playerIsPlayMode ? 'true' : 'false');
  localStorage.setItem('bingo_player_lastbingo', state.playerLastBingoCount.toString());
}

// --- TEXT-TO-SPEECH VOICE SPEAKER ---
function speakText(text) {
  if (!state.voiceEnabled || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'th-TH';
  const voices = window.speechSynthesis.getVoices();
  const thaiVoice = voices.find(v => v.lang.includes('th'));
  if (thaiVoice) {
    utterance.voice = thaiVoice;
  }
  window.speechSynthesis.speak(utterance);
}

// --- CONFETTI CANVAS EFFECTS ---
let confettiActive = false;
let confettiFrameId = null;
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas?.getContext('2d');
let width = 0, height = 0;
let particles = [];

function initConfetti() {
  if (!canvas) return;
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  particles = [];
  const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444'];
  for (let i = 0; i < 150; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * -height - 20,
      r: Math.random() * 5 + 4,
      d: Math.random() * 100 + 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngleIncremental: Math.random() * 0.05 + 0.02,
      tiltAngle: 0,
      speedY: Math.random() * 3 + 2,
      speedX: Math.random() * 2 - 1
    });
  }
}

function drawConfetti() {
  if (!confettiActive || !ctx || !canvas) return;
  ctx.clearRect(0, 0, width, height);

  particles.forEach((p, idx) => {
    p.tiltAngle += p.tiltAngleIncremental;
    p.y += p.speedY;
    p.x += p.speedX + Math.sin(p.tiltAngle) * 0.5;
    p.tilt = Math.sin(p.tiltAngle - idx / 3) * 12;

    if (p.y > height) {
      p.y = -20;
      p.x = Math.random() * width;
    }

    ctx.beginPath();
    ctx.lineWidth = p.r;
    ctx.strokeStyle = p.color;
    ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
    ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
    ctx.stroke();
  });

  confettiFrameId = requestAnimationFrame(drawConfetti);
}

function startConfetti() {
  if (!canvas) return;
  canvas.style.display = 'block';
  confettiActive = true;
  initConfetti();
  drawConfetti();
}

function stopConfetti() {
  if (!canvas) return;
  confettiActive = false;
  canvas.style.display = 'none';
  cancelAnimationFrame(confettiFrameId);
}

window.addEventListener('resize', () => {
  if (confettiActive && canvas) {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
});

// --- SHUFFLING ALGORITHM ---
function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// --- BINGO CALCULATION (5x5) ---
function checkBingoLines(cells) {
  const size = 5;
  const lines = [];
  const markedSet = new Set(cells.filter(c => c && c.marked).map(c => c.id));

  // Check rows
  for (let r = 0; r < size; r++) {
    const line = [];
    for (let c = 0; c < size; c++) line.push(r * size + c);
    if (line.every(idx => markedSet.has(idx))) lines.push(line);
  }

  // Check columns
  for (let c = 0; c < size; c++) {
    const line = [];
    for (let r = 0; r < size; r++) line.push(r * size + c);
    if (line.every(idx => markedSet.has(idx))) lines.push(line);
  }

  // Diagonal 1
  const diag1 = [0, 6, 12, 18, 24];
  if (diag1.every(idx => markedSet.has(idx))) lines.push(diag1);

  // Diagonal 2
  const diag2 = [4, 8, 12, 16, 20];
  if (diag2.every(idx => markedSet.has(idx))) lines.push(diag2);

  return lines;
}

// --- DOM ELEMENT SELECTORS ---
const navTabAdmin = document.getElementById('nav-tab-admin');
const navTabPlayer = document.getElementById('nav-tab-player');
const viewAdmin = document.getElementById('view-admin');
const viewPlayer = document.getElementById('view-player');

const btnSoundGlobal = document.getElementById('btn-toggle-sound');
const iconSoundGlobal = document.getElementById('sound-icon');
const btnVoiceGlobal = document.getElementById('btn-toggle-voice');
const iconVoiceGlobal = document.getElementById('voice-icon');

// --- ADMIN SCREEN SELECTORS ---
const adminDisplayText = document.getElementById('admin-display-text');
const btnAdminSpin = document.getElementById('btn-admin-spin');
const btnAdminSpeak = document.getElementById('btn-admin-speak');
const labelPoolTitle = document.getElementById('label-admin-pool-title');
const adminPoolList = document.getElementById('admin-pool-list');
const labelAdminDrawn = document.getElementById('label-admin-drawn-count');
const labelAdminTotal = document.getElementById('label-admin-total-count');
const barAdminProgress = document.getElementById('bar-admin-progress');
const btnAdminResetHistory = document.getElementById('btn-admin-reset-history');
const adminHistoryTimeline = document.getElementById('admin-history-timeline');

const btnSheetSync = document.getElementById('btn-sheet-sync');
const iconSheetSync = document.getElementById('icon-sheet-sync');
const labelSyncStatus = document.getElementById('label-sync-status');

const bulbs = [
  document.getElementById('bulb-0'),
  document.getElementById('bulb-1'),
  document.getElementById('bulb-2'),
  document.getElementById('bulb-3')
];

// --- PLAYER SCREEN SELECTORS ---
const gridContainer = document.getElementById('bingo-grid');
const tabEdit = document.getElementById('tab-edit');
const tabPlay = document.getElementById('tab-play');
const panelEdit = document.getElementById('panel-edit');
const panelPlay = document.getElementById('panel-play');
const labelPlayerMarked = document.getElementById('label-marked-count');
const labelPlayerBingo = document.getElementById('label-bingo-count');
const victoryModal = document.getElementById('victory-modal');
const btnVictoryRestart = document.getElementById('btn-victory-restart');

const btnPlayerRandom = document.getElementById('btn-random-fill');
const btnPlayerClear = document.getElementById('btn-clear-board');

// --- GLOBAL ROUTING TABS RENDER ---
function renderViews() {
  console.log('renderViews state.activeTab:', state.activeTab);
  console.log('viewAdmin:', viewAdmin, 'viewPlayer:', viewPlayer);
  if (state.activeTab === 'admin') {
    if (viewAdmin) viewAdmin.style.display = 'flex';
    if (viewPlayer) viewPlayer.style.display = 'none';

    navTabAdmin.className = "flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl border-2 border-slate-800 font-black text-lg transition-all bg-amber-100 text-slate-800 border-b-2 shadow-none translate-y-[4px]";
    navTabPlayer.className = "flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl border-2 border-slate-800 font-black text-lg transition-all bg-slate-800 text-amber-50 border-b-6 shadow-[0px_4px_0px_0px_rgba(30,41,59,1)] hover:translate-y-[-2px] active:translate-y-[2px]";
    stopConfetti();
    if (victoryModal) victoryModal.style.display = 'none';

    renderAdminScreen();
  } else {
    if (viewAdmin) viewAdmin.style.display = 'none';
    if (viewPlayer) viewPlayer.style.display = 'flex';

    navTabPlayer.className = "flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl border-2 border-slate-800 font-black text-lg transition-all bg-amber-100 text-slate-800 border-b-2 shadow-none translate-y-[4px]";
    navTabAdmin.className = "flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl border-2 border-slate-800 font-black text-lg transition-all bg-slate-800 text-amber-50 border-b-6 shadow-[0px_4px_0px_0px_rgba(30,41,59,1)] hover:translate-y-[-2px] active:translate-y-[2px]";

    updatePlayerUIMode();
    renderPlayerGrid();
  }
}

navTabAdmin?.addEventListener('click', () => {
  audioSynth.playClick();
  state.activeTab = 'admin';
  saveState();
  renderViews();
});

navTabPlayer?.addEventListener('click', () => {
  audioSynth.playClick();
  state.activeTab = 'player';
  saveState();
  renderViews();
});

// --- AUDIO SETTINGS RENDERING ---
function renderSoundButtons() {
  if (state.soundEnabled) {
    iconSoundGlobal.setAttribute('data-lucide', 'volume-2');
    btnSoundGlobal.className = "p-2 rounded-xl transition-all border-2 border-slate-800 bg-emerald-500 text-white shadow-[2px_2px_0px_rgba(30,41,59,1)] hover:scale-105 active:translate-y-0.5 active:shadow-none";
  } else {
    iconSoundGlobal.setAttribute('data-lucide', 'volume-x');
    btnSoundGlobal.className = "p-2 rounded-xl transition-all border-2 border-slate-800 bg-amber-200 text-slate-700 hover:scale-105 active:translate-y-0.5 active:shadow-none";
  }

  if (state.voiceEnabled) {
    iconVoiceGlobal.className = "h-5 w-5 animate-bounce";
    btnVoiceGlobal.className = "p-2 rounded-xl transition-all border-2 border-slate-800 bg-emerald-500 text-white shadow-[2px_2px_0px_rgba(30,41,59,1)] hover:scale-105 active:translate-y-0.5 active:shadow-none";
  } else {
    iconVoiceGlobal.className = "h-5 w-5";
    btnVoiceGlobal.className = "p-2 rounded-xl transition-all border-2 border-slate-800 bg-amber-200 text-slate-700 hover:scale-105 active:translate-y-0.5 active:shadow-none";
  }

  if (window.lucide) window.lucide.createIcons();
}

btnSoundGlobal?.addEventListener('click', () => {
  state.soundEnabled = !state.soundEnabled;
  audioSynth.toggle(state.soundEnabled);
  audioSynth.playClick();
  renderSoundButtons();
  saveState();
});

btnVoiceGlobal?.addEventListener('click', () => {
  audioSynth.playClick();
  state.voiceEnabled = !state.voiceEnabled;
  renderSoundButtons();
  saveState();
});

// --- ADMIN SCREEN LOGIC ---
function renderAdminScreen() {
  if (labelPoolTitle) labelPoolTitle.textContent = `คลังหมวดหมู่ทั้งหมด (${state.adminPool.length} รายการ)`;
  if (labelAdminDrawn) labelAdminDrawn.textContent = state.adminDrawn.length;
  if (labelAdminTotal) labelAdminTotal.textContent = state.adminPool.length;

  if (labelSyncStatus) {
    labelSyncStatus.textContent = state.lastSyncTime
      ? `ซิงก์ล่าสุด: ${state.lastSyncTime}`
      : 'ยังไม่ได้ซิงก์ข้อมูล';
  }

  if (adminDisplayText) {
    if (state.isSpinning) {
      adminDisplayText.className = "text-emerald-400 font-extrabold text-2xl sm:text-3xl animate-pulse tracking-wide font-mono";
      adminDisplayText.textContent = `🎰 ${state.adminPool[state.spinIndex] || 'สุ่ม...'}`;
    } else if (state.adminCurrent) {
      adminDisplayText.className = "text-emerald-400 font-black text-3xl sm:text-4xl leading-relaxed tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] px-4 category-pop-animation";
      adminDisplayText.textContent = state.adminCurrent;
    } else {
      adminDisplayText.className = "text-slate-500 font-bold text-lg italic";
      adminDisplayText.textContent = `กดปุ่ม "หมุนวงล้อหมวดหมู่" ด้านล่างเพื่อเริ่มจับสลาก!`;
    }
  }

  if (btnAdminSpeak) {
    if (state.adminCurrent && !state.isSpinning) {
      btnAdminSpeak.style.display = 'flex';
    } else {
      btnAdminSpeak.style.display = 'none';
    }
  }

  if (btnAdminResetHistory) {
    if (state.adminDrawn.length > 0) {
      btnAdminResetHistory.style.display = 'block';
    } else {
      btnAdminResetHistory.style.display = 'none';
    }
  }

  if (barAdminProgress) {
    const progressWidth = state.adminPool.length > 0
      ? (state.adminDrawn.length / state.adminPool.length) * 100
      : 0;
    barAdminProgress.style.width = `${progressWidth}%`;
  }

  if (adminPoolList) {
    adminPoolList.innerHTML = '';
    state.adminPool.forEach((item, idx) => {
      const isDrawn = state.adminDrawn.includes(item);
      const itemEl = document.createElement('div');
      itemEl.className = `border-2 border-slate-800/20 rounded-xl p-2.5 flex items-center justify-between gap-3 shadow-sm ${isDrawn ? 'bg-emerald-50 border-emerald-800/30' : 'bg-white'
        }`;

      itemEl.innerHTML = `
        <div class="flex items-center gap-2 w-full">
          <span class="text-xs font-bold text-slate-500">#${idx + 1}</span>
          <span class="text-sm font-extrabold ${isDrawn ? 'text-emerald-900 line-through opacity-60' : 'text-slate-800'}">${item}</span>
          ${isDrawn ? '<span class="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded ml-auto shrink-0">จับแล้ว</span>' : ''}
        </div>
      `;

      adminPoolList.appendChild(itemEl);
    });
  }

  if (adminHistoryTimeline) {
    adminHistoryTimeline.innerHTML = '';
    if (state.adminDrawn.length === 0) {
      adminHistoryTimeline.innerHTML = `
        <div class="text-center py-16 select-none">
          <p class="text-sm italic text-slate-500">ยังไม่มีหมวดหมู่ที่สุ่มจับได้</p>
          <p class="text-[10px] text-slate-400 mt-1">เริ่มเกมโดยกดปุ่ม "หมุนวงล้อหมวดหมู่" ด้านซ้าย</p>
        </div>
      `;
    } else {
      const wrapper = document.createElement('div');
      wrapper.className = "relative border-l-4 border-slate-800/30 ml-4 pl-4 space-y-4";

      state.adminDrawn.forEach((item, idx) => {
        const entry = document.createElement('div');
        entry.className = "relative group";

        entry.innerHTML = `
          <div class="absolute -left-[26px] top-1 w-4 h-4 rounded-full border-2 border-slate-850 shadow ${idx === 0 ? 'bg-emerald-500 scale-125 border-emerald-700 animate-pulse' : 'bg-white'
          }"></div>
          <div class="p-2.5 rounded-xl border-2 border-slate-800 transition-all ${idx === 0 ? 'bg-emerald-50 shadow-[2px_2px_0px_rgba(30,41,59,1)]' : 'bg-white/70 shadow-sm'
          }">
            <div class="flex items-center justify-between gap-4">
              <span class="text-sm font-extrabold ${idx === 0 ? 'text-emerald-950' : 'text-slate-850'}">${item}</span>
              <span class="text-[9px] text-slate-600 font-extrabold bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded shrink-0">
                สุ่มลำดับ #${state.adminDrawn.length - idx}
              </span>
            </div>
          </div>
        `;
        wrapper.appendChild(entry);
      });
      adminHistoryTimeline.appendChild(wrapper);
    }
  }

  if (window.lucide) window.lucide.createIcons();
}

// Google Sheet Sync Categories Ingestion
async function syncGoogleSheetCategories(showFeedback = true) {
  if (!btnSheetSync) return;

  // Animate the loader icon
  if (iconSheetSync) iconSheetSync.classList.add('animate-spin');
  btnSheetSync.disabled = true;

  const url = 'https://docs.google.com/spreadsheets/d/1DrxfnXHh3SsI60n3ovADjgmy3_t1Y0uJWuuD7sbUB9I/export?format=csv';
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    const text = await response.text();

    // Parse CSV (read A column, which is the first item on each line)
    const lines = text.split(/\r?\n/);
    const parsed = lines
      .map(line => {
        const clean = line.replace(/^["']|["']$/g, '').trim();
        const firstCol = clean.split(',')[0].trim();
        return firstCol;
      })
      .filter(Boolean);

    if (parsed.length > 0) {
      state.adminPool = parsed;
      // Filter out drawn categories that are no longer in the pool
      state.adminDrawn = state.adminDrawn.filter(cat => parsed.includes(cat));
      if (state.adminCurrent && !parsed.includes(state.adminCurrent)) {
        state.adminCurrent = null;
      }

      const now = new Date();
      state.lastSyncTime = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      saveState();
      renderAdminScreen();
      audioSynth.playClick();
      // Sync new pool to session
      if (Session.active && Session.isHost) {
        Session.syncPool(parsed);
      }

      if (showFeedback) {
        alert(`ซิงก์ข้อมูลหมวดหมู่จาก Google Sheet สำเร็จ! ทั้งหมด ${parsed.length} รายการ`);
      }
    } else {
      if (showFeedback) alert('ไม่พบข้อมูลหมวดหมู่ในคอลัมน์ A ของ Google Sheet');
    }
  } catch (err) {
    console.error('Failed to sync Google Sheet:', err);
    if (showFeedback) {
      alert('ไม่สามารถซิงก์ข้อมูลจาก Google Sheet ได้ โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
    }
  } finally {
    if (iconSheetSync) iconSheetSync.classList.remove('animate-spin');
    btnSheetSync.disabled = false;
  }
}

btnSheetSync?.addEventListener('click', () => {
  audioSynth.playClick();
  syncGoogleSheetCategories(true);
});

// Spin Categories Roulette
btnAdminSpin?.addEventListener('click', () => {
  if (state.isSpinning) return;
  audioSynth.playClick();

  const remaining = state.adminPool.filter(cat => !state.adminDrawn.includes(cat));
  if (remaining.length === 0) {
    alert('จับสลากหมวดหมู่สุ่มครบหมดเกลี้ยงแล้ว! เคลียร์ประวัติแล้วเริ่มใหม่');
    return;
  }

  state.isSpinning = true;
  state.adminCurrent = null;
  renderAdminScreen();

  const duration = 2000;
  const startTime = Date.now();
  const targetCategory = remaining[Math.floor(Math.random() * remaining.length)];

  // Bulb flash animator during spin
  let bulbInterval = setInterval(() => {
    bulbs.forEach(b => b?.classList.add('bg-slate-400'));
    const activeBulb = bulbs[Math.floor(Math.random() * bulbs.length)];
    if (activeBulb) {
      activeBulb.classList.remove('bg-slate-400');
      const color = ['bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500'][Math.floor(Math.random() * 4)];
      activeBulb.className = `w-3.5 h-3.5 rounded-full border-2 border-slate-800 shadow ${color} animate-pulse`;
    }
  }, 100);

  const tick = () => {
    const elapsed = Date.now() - startTime;
    if (elapsed >= duration) {
      clearInterval(bulbInterval);
      bulbs[0].className = "w-3.5 h-3.5 rounded-full border-2 border-slate-800 bg-red-400";
      bulbs[1].className = "w-3.5 h-3.5 rounded-full border-2 border-slate-800 bg-yellow-400";
      bulbs[2].className = "w-3.5 h-3.5 rounded-full border-2 border-slate-800 bg-green-400";
      bulbs[3].className = "w-3.5 h-3.5 rounded-full border-2 border-slate-800 bg-blue-400";

      state.isSpinning = false;
      state.adminCurrent = targetCategory;
      state.adminDrawn.unshift(targetCategory);
      saveState();
      renderAdminScreen();
      audioSynth.playSpinTick(800);
      speakText(targetCategory);
      // Broadcast draw to session players
      if (Session.active && Session.isHost) {
        Session.broadcastDraw(targetCategory, state.adminDrawn);
      }
    } else {
      state.spinIndex = Math.floor(Math.random() * state.adminPool.length);
      audioSynth.playSpinTick(350 + Math.random() * 150);
      renderAdminScreen();

      const nextDelay = 60 + Math.pow(elapsed / duration, 2.5) * 220;
      setTimeout(tick, nextDelay);
    }
  };

  tick();
});

// Re-pronounce button
btnAdminSpeak?.addEventListener('click', () => {
  if (state.adminCurrent) {
    audioSynth.playClick();
    speakText(state.adminCurrent);
  }
});

btnAdminResetHistory?.addEventListener('click', () => {
  handleResetDraws();
});

function handleResetDraws() {
  audioSynth.playClick();
  if (window.confirm("ต้องการรีเซ็ตประวัติการออกทั้งหมดใช่หรือไม่?")) {
    state.adminDrawn = [];
    state.adminCurrent = null;
    saveState();
    renderAdminScreen();
    // Broadcast reset to session players
    if (Session.active && Session.isHost) {
      Session.broadcastReset();
    }
  }
}

// --- PLAYER SCREEN RENDERING & LOGIC ---

function updatePlayerUIMode() {
  if (state.playerIsPlayMode) {
    if (panelEdit) panelEdit.style.display = 'none';
    if (panelPlay) panelPlay.style.display = 'flex';

    if (tabPlay) tabPlay.className = "flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl border-2 border-slate-800 font-black text-lg transition-all bg-amber-100 text-slate-800 border-b-2 shadow-none translate-y-[4px]";
    if (tabEdit) tabEdit.className = "flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl border-2 border-slate-800 font-black text-lg transition-all bg-slate-800 text-amber-50 border-b-6 shadow-[0px_4px_0px_0px_rgba(30,41,59,1)] hover:translate-y-[-2px] active:translate-y-[2px]";
  } else {
    if (panelEdit) panelEdit.style.display = 'flex';
    if (panelPlay) panelPlay.style.display = 'none';

    if (tabEdit) tabEdit.className = "flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl border-2 border-slate-800 font-black text-lg transition-all bg-amber-100 text-slate-800 border-b-2 shadow-none translate-y-[4px]";
    if (tabPlay) tabPlay.className = "flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl border-2 border-slate-800 font-black text-lg transition-all bg-slate-800 text-amber-50 border-b-6 shadow-[0px_4px_0px_0px_rgba(30,41,59,1)] hover:translate-y-[-2px] active:translate-y-[2px]";

    stopConfetti();
    if (victoryModal) victoryModal.style.display = 'none';
  }
}

function renderPlayerGrid() {
  if (!gridContainer) return;
  gridContainer.innerHTML = '';

  const matchedLines = checkBingoLines(state.playerCells);
  const winningCells = new Set(matchedLines.flat());

  state.playerCells.forEach((cell, idx) => {
    if (!cell) return;
    const cellEl = document.createElement('div');
    let cellClasses = "relative aspect-square rounded-2xl border-4 border-slate-800 p-2 flex flex-col items-center justify-center text-center select-none transition-all ";

    if (state.playerIsPlayMode) {
      if (cell.marked) {
        if (winningCells.has(cell.id)) {
          cellClasses += "bg-emerald-100 border-emerald-600 shadow-none translate-y-[4px] ring-4 ring-emerald-500/30";
        } else {
          cellClasses += "bg-amber-100 shadow-none translate-y-[4px]";
        }
      } else {
        cellClasses += "bg-amber-50 cursor-pointer shadow-[2px_2px_0px_0px_rgba(30,41,59,1)] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] active:translate-y-[2px] active:shadow-none";
      }

      const textSpan = document.createElement('span');
      textSpan.className = "text-xs sm:text-sm font-black text-slate-800 leading-tight break-all line-clamp-3 select-none";
      textSpan.textContent = cell.name || 'ว่าง';
      if (!cell.name) textSpan.className += " text-slate-350 italic";
      cellEl.className = cellClasses;
      cellEl.appendChild(textSpan);

      if (cell.marked) {
        const stampOverlay = document.createElement('div');
        stampOverlay.className = "absolute inset-0 flex items-center justify-center pointer-events-none select-none";
        stampOverlay.innerHTML = `
          <div class="stamp-mark bg-red-600/25 border-4 border-red-600/70 rounded-full w-[80%] h-[80%] flex items-center justify-center transform rotate-[-12deg] ink-stamp">
            <span class="text-[10px] sm:text-xs font-black text-red-600 tracking-wider uppercase select-none opacity-80">MARKED</span>
          </div>
        `;
        cellEl.appendChild(stampOverlay);
      }

      cellEl.addEventListener('click', () => {
        if (!cell.name || !cell.name.trim()) return;
        audioSynth.playClick();
        cell.marked = !cell.marked;
        saveState();
        renderPlayerGrid();
        checkPlayerWinCondition();
      });

    } else {
      cellClasses += "bg-white focus-within:ring-4 focus-within:ring-amber-300 shadow-[2px_2px_0px_0px_rgba(30,41,59,1)]";
      cellEl.className = cellClasses;

      const textarea = document.createElement('textarea');
      textarea.className = "w-full h-full bg-transparent resize-none border-none text-xs sm:text-sm font-black text-slate-800 leading-tight focus:outline-none text-center m-auto flex items-center justify-center select-text cursor-text";
      textarea.value = cell.name || "";
      textarea.placeholder = `ดารา #${cell.id + 1}`;
      textarea.maxLength = 50;

      textarea.addEventListener('input', (e) => {
        cell.name = e.target.value;
        saveState();
        // Sync board to session (only in lobby, before game starts)
        if (Session.active && Session.isPlayer && !state.sessionGameStarted) {
          Session.updatePlayerCells(state.playerCells);
        }
      });

      cellEl.appendChild(textarea);
    }

    gridContainer.appendChild(cellEl);
  });

  const markedCount = state.playerCells.filter(c => c && c.marked && c.name && c.name.trim()).length;
  if (labelPlayerMarked) {
    labelPlayerMarked.textContent = `ปั๊มตราแล้ว: ${markedCount} / 25 ช่อง`;
  }
  if (labelPlayerBingo) {
    labelPlayerBingo.textContent = `บิงโก: ${matchedLines.length} เส้น`;
  }
}

function checkPlayerWinCondition() {
  const currentLines = checkBingoLines(state.playerCells);
  if (currentLines.length > state.playerLastBingoCount) {
    if (victoryModal) victoryModal.style.display = 'flex';
    startConfetti();
    audioSynth.playWin();
  }
  state.playerLastBingoCount = currentLines.length;
  saveState();
}

tabEdit?.addEventListener('click', () => {
  audioSynth.playClick();
  state.playerIsPlayMode = false;
  saveState();
  updatePlayerUIMode();
  renderPlayerGrid();
});

tabPlay?.addEventListener('click', () => {
  audioSynth.playClick();
  state.playerIsPlayMode = true;
  saveState();
  updatePlayerUIMode();
  renderPlayerGrid();
});

btnPlayerRandom?.addEventListener('click', () => {
  audioSynth.playClick();
  const shuffledNames = shuffleArray(CELEBRITY_NAMES);
  state.playerCells.forEach((cell, idx) => {
    if (cell) cell.name = shuffledNames[idx] || "";
  });
  saveState();
  renderPlayerGrid();
});

btnPlayerClear?.addEventListener('click', () => {
  audioSynth.playClick();
  if (window.confirm("ต้องการล้างกระดานและเคลียร์ตราประทับทั้งหมดหรือไม่?")) {
    state.playerCells.forEach(cell => {
      if (cell) {
        cell.name = "";
        cell.marked = false;
      }
    });
    state.playerLastBingoCount = 0;
    saveState();
    renderPlayerGrid();
  }
});

btnVictoryRestart?.addEventListener('click', () => {
  audioSynth.playClick();
  state.playerCells.forEach(cell => {
    if (cell) cell.marked = false;
  });
  state.playerLastBingoCount = 0;
  saveState();
  stopConfetti();
  if (victoryModal) victoryModal.style.display = 'none';
  renderPlayerGrid();
});

// --- SESSION UI MANAGEMENT ---

// DOM selectors for session panel
const sessionIdle            = document.getElementById('session-idle');
const sessionActivePanel     = document.getElementById('session-active');
const sessionCodeDisplay     = document.getElementById('session-code-display');
const sessionPlayerCount     = document.getElementById('session-player-count');
const sessionPlayerListWrap  = document.getElementById('session-player-list-wrap');
const sessionPlayerList      = document.getElementById('session-player-list');
const sessionHostDrawDisplay = document.getElementById('session-host-draw-display');
const sessionHostCurrent     = document.getElementById('session-host-current');
const sessionGameStateBanner = document.getElementById('session-game-state-banner');
const sessionGameStateText   = document.getElementById('session-game-state-text');
const sessionStatusBadge     = document.getElementById('session-status-badge');
const sessionStatusText      = document.getElementById('session-status-text');
const sessionError           = document.getElementById('session-error');
const btnSessionCreate       = document.getElementById('btn-session-create');
const btnSessionJoin         = document.getElementById('btn-session-join');
const btnSessionCopy         = document.getElementById('btn-session-copy');
const btnSessionStart        = document.getElementById('btn-session-start');
const btnSessionLeave        = document.getElementById('btn-session-leave');
const btnSessionLeaveLabel   = document.getElementById('btn-session-leave-label');
const inputSessionCode       = document.getElementById('input-session-code');

function showSessionError(msg) {
  if (!sessionError) return;
  sessionError.textContent = msg;
  sessionError.classList.remove('hidden');
  setTimeout(() => sessionError.classList.add('hidden'), 5000);
}

function renderSessionPanel() {
  if (!Session.active) {
    // Idle state
    sessionIdle?.classList.remove('hidden');
    sessionActivePanel?.classList.add('hidden');
    sessionActivePanel?.classList.remove('flex');
    sessionStatusBadge?.classList.add('hidden');
    return;
  }

  // Active state
  sessionIdle?.classList.add('hidden');
  sessionActivePanel?.classList.remove('hidden');
  sessionActivePanel?.classList.add('flex');
  sessionStatusBadge?.classList.remove('hidden');

  if (sessionCodeDisplay) sessionCodeDisplay.textContent = Session.code;
  if (sessionStatusText) sessionStatusText.textContent = Session.isHost ? 'Host' : 'Player';

  // Role-specific elements
  if (Session.isHost) {
    sessionPlayerListWrap?.classList.remove('hidden');
    sessionHostDrawDisplay?.classList.add('hidden');
    sessionHostDrawDisplay?.classList.remove('flex');
    btnSessionStart?.classList.remove('hidden');
    if (btnSessionLeaveLabel) btnSessionLeaveLabel.textContent = 'ยุติเซสชัน';
  } else {
    sessionPlayerListWrap?.classList.add('hidden');
    sessionHostDrawDisplay?.classList.remove('hidden');
    sessionHostDrawDisplay?.classList.add('flex');
    btnSessionStart?.classList.add('hidden');
    if (btnSessionLeaveLabel) btnSessionLeaveLabel.textContent = 'ออกจากเซสชัน';
  }

  // Game state banner
  if (state.sessionGameStarted) {
    if (sessionGameStateBanner) {
      sessionGameStateBanner.className = 'flex items-center gap-2 text-sm font-black px-4 py-2.5 rounded-xl border-2 border-emerald-700 bg-emerald-100 text-emerald-900';
    }
    if (sessionGameStateText) sessionGameStateText.textContent = '🎮 เกมกำลังดำเนินอยู่!';
    // Lock Edit button for players in-game
    if (Session.isPlayer) {
      if (tabEdit) tabEdit.style.pointerEvents = 'none';
      if (tabEdit) tabEdit.style.opacity = '0.4';
    }
  } else {
    if (sessionGameStateBanner) {
      sessionGameStateBanner.className = 'flex items-center gap-2 text-sm font-black px-4 py-2.5 rounded-xl border-2 border-amber-600 bg-amber-100 text-amber-900';
    }
    if (sessionGameStateText) sessionGameStateText.textContent = 'ล็อบบี้ — รอ Host เริ่มเกม';
    if (Session.isPlayer) {
      if (tabEdit) tabEdit.style.pointerEvents = '';
      if (tabEdit) tabEdit.style.opacity = '';
    }
  }

  if (window.lucide) window.lucide.createIcons();
}

function renderSessionPlayerList(players) {
  if (!sessionPlayerList || !sessionPlayerCount) return;
  const entries = Object.values(players || {});
  sessionPlayerCount.textContent = entries.length;
  sessionPlayerList.innerHTML = '';
  entries.forEach(p => {
    const tag = document.createElement('span');
    tag.className = 'text-xs font-black px-3 py-1.5 rounded-full border-2 border-slate-800 bg-white text-slate-800 shadow-[1px_1px_0px_rgba(30,41,59,1)]';
    tag.textContent = `👤 ${p.nickname || 'ผู้เล่น'}`;
    sessionPlayerList.appendChild(tag);
  });
}

// ── Host: create session ──────────────────────────────────────────────────────
btnSessionCreate?.addEventListener('click', async () => {
  audioSynth.playClick();
  btnSessionCreate.disabled = true;
  btnSessionCreate.textContent = 'กำลังสร้าง...';
  try {
    const code = await Session.create(state.adminPool);
    renderSessionPanel();
    // Watch player list
    Session.onPlayersChange((players) => {
      renderSessionPlayerList(players);
      renderSessionPanel();
    });
    audioSynth.playWin();
  } catch (err) {
    console.error('Session create failed:', err);
    showSessionError('ไม่สามารถสร้างเซสชันได้ กรุณาตรวจสอบการเชื่อมต่อ');
  } finally {
    btnSessionCreate.disabled = false;
    btnSessionCreate.innerHTML = '<i data-lucide="plus-circle" class="h-4 w-4"></i> สร้างห้องเกม (Host)';
    if (window.lucide) window.lucide.createIcons();
  }
});

// ── Player: join session ──────────────────────────────────────────────────────
btnSessionJoin?.addEventListener('click', async () => {
  const code = inputSessionCode?.value?.trim();
  if (!code || code.length < 6) {
    showSessionError('กรุณากรอกรหัส 6 ตัวอักษร');
    return;
  }
  audioSynth.playClick();
  btnSessionJoin.disabled = true;
  btnSessionJoin.textContent = 'กำลังเชื่อมต่อ...';
  try {
    const result = await Session.join(code, null, state.playerCells);
    if (!result.ok) {
      showSessionError(result.error);
      return;
    }
    state.sessionGameStarted = result.gameStarted || false;
    renderSessionPanel();
    // Switch to player tab after joining
    state.activeTab = 'player';
    saveState();
    renderViews();
    // Listen for host draw events
    Session.onHostUpdate((hostData) => {
      if (sessionHostCurrent) {
        sessionHostCurrent.textContent = hostData.current || 'รอ Host เริ่มสุ่ม...';
      }
    });
    // Listen for game start
    Session.onGameStarted(() => {
      state.sessionGameStarted = true;
      // Force play mode — editing locked
      state.playerIsPlayMode = true;
      saveState();
      updatePlayerUIMode();
      renderPlayerGrid();
      renderSessionPanel();
      audioSynth.playWin();
    });
    audioSynth.playClick();
  } catch (err) {
    console.error('Session join failed:', err);
    showSessionError('ไม่สามารถเข้าร่วมเซสชันได้ กรุณาลองใหม่');
  } finally {
    btnSessionJoin.disabled = false;
    btnSessionJoin.innerHTML = '<i data-lucide="log-in" class="h-4 w-4"></i> เข้าร่วม';
    if (window.lucide) window.lucide.createIcons();
  }
});

// ── Copy code to clipboard ────────────────────────────────────────────────────
btnSessionCopy?.addEventListener('click', () => {
  if (!Session.code) return;
  audioSynth.playClick();
  navigator.clipboard.writeText(Session.code).then(() => {
    if (btnSessionCopy) {
      btnSessionCopy.textContent = '✓ คัดลอกแล้ว!';
      setTimeout(() => {
        btnSessionCopy.innerHTML = '<i data-lucide="copy" class="h-4 w-4"></i> คัดลอก';
        if (window.lucide) window.lucide.createIcons();
      }, 1500);
    }
  });
});

// ── Host: start game ──────────────────────────────────────────────────────────
btnSessionStart?.addEventListener('click', async () => {
  audioSynth.playClick();
  if (!Session.isHost) return;
  btnSessionStart.disabled = true;
  try {
    await Session.startGame();
    state.sessionGameStarted = true;
    renderSessionPanel();
  } catch (err) {
    console.error('Start game failed:', err);
    showSessionError('ไม่สามารถเริ่มเกมได้');
  } finally {
    btnSessionStart.disabled = false;
  }
});

// ── Leave session ─────────────────────────────────────────────────────────────
btnSessionLeave?.addEventListener('click', async () => {
  audioSynth.playClick();
  const confirmed = window.confirm(
    Session.isHost
      ? 'ยุติเซสชัน? ผู้เล่นทุกคนจะถูกตัดการเชื่อมต่อ'
      : 'ออกจากเซสชันนี้ใช่หรือไม่?'
  );
  if (!confirmed) return;
  await Session.leave();
  state.sessionGameStarted = false;
  // Restore edit mode for player
  if (tabEdit) { tabEdit.style.pointerEvents = ''; tabEdit.style.opacity = ''; }
  renderSessionPanel();
  if (window.lucide) window.lucide.createIcons();
});

// Auto-uppercase the code input
inputSessionCode?.addEventListener('input', (e) => {
  e.target.value = e.target.value.toUpperCase();
});

// Join by pressing Enter in code input
inputSessionCode?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') btnSessionJoin?.click();
});

// --- MAIN RUNTIME INITIALIZATION ---
loadState();
audioSynth.toggle(state.soundEnabled);
renderViews();
renderSoundButtons();
renderSessionPanel();

// Preemptively fetch configuration and initialize Firebase
ensureFirebaseInitialized().catch(err => console.warn(err));

// Auto-sync Google Sheet categories on load without showing noisy alert alerts
syncGoogleSheetCategories(false);

// Hydrate Lucide Icons
if (window.lucide) {
  window.lucide.createIcons();
}
