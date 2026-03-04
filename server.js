const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = 3456;

app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// GAME DATA
// ============================================================

const CHARACTERS = {
  kirsal_kiz: {
    name: 'Kırsal Bölge Kız Öğrenci',
    emoji: '👧',
    color: '#f472b6',
    description: 'Kırsal bölgede yaşayan, fırsat eşitsizliğiyle boğuşan kız öğrenci',
    stats: { para: 1, egitim: 1, saglik: 2, sosyalHak: 1, psikoloji: 2 }
  },
  sehirli_erkek: {
    name: 'Şehirli Erkek Öğrenci',
    emoji: '🧑',
    color: '#60a5fa',
    description: 'Orta sınıf bir şehir ailesinin çocuğu',
    stats: { para: 3, egitim: 3, saglik: 3, sosyalHak: 3, psikoloji: 3 }
  },
  gocmen_isci: {
    name: 'Göçmen İşçi',
    emoji: '👷',
    color: '#fb923c',
    description: 'Yabancı bir ülkede çalışmak zorunda kalan göçmen işçi',
    stats: { para: 1, egitim: 2, saglik: 2, sosyalHak: 1, psikoloji: 3 }
  },
  ust_sinif: {
    name: 'Üst Sınıf Çocuk',
    emoji: '👑',
    color: '#fbbf24',
    description: 'Her türlü imkana sahip, ayrıcalıklı bir ailenin çocuğu',
    stats: { para: 5, egitim: 4, saglik: 5, sosyalHak: 4, psikoloji: 4 }
  },
  engelli: {
    name: 'Engelli Birey',
    emoji: '♿',
    color: '#a78bfa',
    description: 'Fiziksel engeli nedeniyle ek zorluklarla karşılaşan birey',
    stats: { para: 2, egitim: 2, saglik: 1, sosyalHak: 1, psikoloji: 3 }
  },
  tek_ebeveyn: {
    name: 'Tek Ebeveynli Çocuk',
    emoji: '🧒',
    color: '#34d399',
    description: 'Tek ebeveynli ailede büyüyen, zorluklarla karşılaşan çocuk',
    stats: { para: 2, egitim: 2, saglik: 3, sosyalHak: 2, psikoloji: 2 }
  }
};

const SYSTEM_CARDS = [
  {
    id: 'ekonomik_kriz',
    name: 'Ekonomik Kriz',
    emoji: '📉',
    description: 'Ekonomik kriz patlak verdi! Herkes -1 Para',
    color: '#f97316',
    getEffect: () => [{ stat: 'para', change: -1 }]
  },
  {
    id: 'egitim_reformu',
    name: 'Eğitim Reformu',
    emoji: '📚',
    description: 'Eğitim reformu! Eğitim ≥2 olanlar +1 Eğitim kazanır',
    color: '#eab308',
    getEffect: (player) => player.stats.egitim >= 2 ? [{ stat: 'egitim', change: 1 }] : []
  },
  {
    id: 'deprem',
    name: 'Deprem',
    emoji: '🌋',
    description: 'Büyük deprem! Herkes -1 Sağlık',
    color: '#f97316',
    getEffect: () => [{ stat: 'saglik', change: -1 }]
  },
  {
    id: 'pandemi',
    name: 'Pandemi',
    emoji: '🦠',
    description: 'Pandemi ilan edildi! Herkes -1 Para, -1 Sağlık',
    color: '#dc2626',
    getEffect: () => [{ stat: 'para', change: -1 }, { stat: 'saglik', change: -1 }]
  },
  {
    id: 'sosyal_yardim_paketi',
    name: 'Sosyal Yardım Paketi',
    emoji: '🤝',
    description: 'Sosyal yardım paketi! Para ≤1 olanlar +2 Para alır',
    color: '#22c55e',
    getEffect: (player) => player.stats.para <= 1 ? [{ stat: 'para', change: 2 }] : []
  }
];

// 27 kare: 0=BAŞLANGIÇ, saat yönünde döngü
// Grid: 10 sütun x 6 satır [row, col] (1-indexed)
const SQUARES = [
  // TOP ROW left→right
  { id: 0,  name: 'BAŞLANGIÇ',          type: 'start',       emoji: '🏁', color: '#22c55e', pos: [1,1],  desc: 'Hayat yolculuğu başlıyor!', getEffect: () => [] },
  { id: 1,  name: 'BURS',               type: 'opportunity', emoji: '🎓', color: '#16a34a', pos: [1,2],  desc: 'Burs kazandın! Para ≤1 ise +3 Eğitim, diğer +1', getEffect: (p) => p.stats.para <= 1 ? [{stat:'egitim',change:3}] : [{stat:'egitim',change:1}] },
  { id: 2,  name: 'MENTOR',             type: 'opportunity', emoji: '🤝', color: '#15803d', pos: [1,3],  desc: 'Mentor buldun → +2 Eğitim', getEffect: () => [{stat:'egitim',change:2}] },
  { id: 3,  name: 'İŞ FIRSATI',         type: 'opportunity', emoji: '💼', color: '#16a34a', pos: [1,4],  desc: 'Tanıdık sayesinde iş → +2 Para', getEffect: () => [{stat:'para',change:2}] },
  { id: 4,  name: 'EKONOMİK KRİZ',     type: 'negative',    emoji: '📉', color: '#ea580c', pos: [1,5],  desc: 'Ekonomik kriz → -1 Para', getEffect: () => [{stat:'para',change:-1}] },
  { id: 5,  name: 'EĞİTİM REFORMU',    type: 'conditional', emoji: '📖', color: '#ca8a04', pos: [1,6],  desc: 'Eğitim reformu → Eğitim ≥2 ise +1', getEffect: (p) => p.stats.egitim >= 2 ? [{stat:'egitim',change:1}] : [] },
  { id: 6,  name: 'AYRIMCILIK',         type: 'obstacle',    emoji: '⛔', color: '#dc2626', pos: [1,7],  desc: 'Ayrımcılığa uğradın → -1 Sosyal Hak', isObstacle: true, getEffect: () => [{stat:'sosyalHak',change:-1}] },
  { id: 7,  name: 'SAĞLIK SORUNU',      type: 'obstacle',    emoji: '🏥', color: '#b91c1c', pos: [1,8],  desc: 'Sağlık sorunu yaşadın → -2 Sağlık', isObstacle: true, getEffect: () => [{stat:'saglik',change:-2}] },
  { id: 8,  name: 'MADDİ\nYETERSİZLİK', type: 'obstacle',   emoji: '💸', color: '#991b1b', pos: [1,9],  desc: 'Maddi yetersizlik → -2 Para', isObstacle: true, getEffect: () => [{stat:'para',change:-2}] },
  { id: 9,  name: 'SOSYAL HAKLAR',      type: 'corner',      emoji: '⚖️', color: '#1d4ed8', pos: [1,10], desc: 'Sosyal haklarını kullandın → +1 Sosyal Hak', getEffect: () => [{stat:'sosyalHak',change:1}] },

  // RIGHT SIDE top→bottom
  { id: 10, name: 'SOSYAL PROJE',       type: 'opportunity', emoji: '🤲', color: '#2563eb', pos: [2,10], desc: 'Sosyal projeye katıldın → +1 Sosyal Hak, +1 Psikoloji', getEffect: () => [{stat:'sosyalHak',change:1},{stat:'psikoloji',change:1}] },
  { id: 11, name: 'GİRİŞİM DESTEĞİ',   type: 'opportunity', emoji: '🚀', color: '#16a34a', pos: [3,10], desc: 'Girişimcilik desteği aldın → +3 Para', getEffect: () => [{stat:'para',change:3}] },
  { id: 12, name: 'TERFİ',              type: 'opportunity', emoji: '📈', color: '#15803d', pos: [4,10], desc: 'Terfi ettin → +3 Para', getEffect: () => [{stat:'para',change:3}] },
  { id: 13, name: 'PANDEMİ',            type: 'obstacle',    emoji: '🦠', color: '#7f1d1d', pos: [5,10], desc: 'Pandemi → -1 Para, -1 Sağlık', isObstacle: true, getEffect: () => [{stat:'para',change:-1},{stat:'saglik',change:-1}] },

  // BOTTOM-RIGHT CORNER
  { id: 14, name: 'BİTİŞ\nADALET',     type: 'end',         emoji: '🏛️', color: '#b45309', pos: [6,10], desc: 'Bitiş! Adalet → tüm statlar +1', getEffect: () => [{stat:'para',change:1},{stat:'egitim',change:1},{stat:'saglik',change:1},{stat:'sosyalHak',change:1},{stat:'psikoloji',change:1}] },

  // BOTTOM ROW right→left
  { id: 15, name: 'NETWORK',            type: 'opportunity', emoji: '🌐', color: '#16a34a', pos: [6,9],  desc: 'Güçlü network → +2 Sosyal Hak', getEffect: () => [{stat:'sosyalHak',change:2}] },
  { id: 16, name: 'BAŞARI',             type: 'opportunity', emoji: '🏆', color: '#15803d', pos: [6,8],  desc: 'Başarı kazandın → +2 Eğitim', getEffect: () => [{stat:'egitim',change:2}] },
  { id: 17, name: 'TASARRUF',           type: 'opportunity', emoji: '💰', color: '#a16207', pos: [6,7],  desc: 'Tasarruf yaptın → +1 Para, +1 Psikoloji', getEffect: () => [{stat:'para',change:1},{stat:'psikoloji',change:1}] },
  { id: 18, name: 'KRİZ',               type: 'negative',    emoji: '📊', color: '#c2410c', pos: [6,6],  desc: 'Finansal kriz → -1 Para', getEffect: () => [{stat:'para',change:-1}] },
  { id: 19, name: 'SOSYAL YARDIM',      type: 'opportunity', emoji: '🆘', color: '#166534', pos: [6,5],  desc: 'Sosyal yardım → Para ≤1 ise +2, diğer +1', getEffect: (p) => p.stats.para <= 1 ? [{stat:'para',change:2}] : [{stat:'para',change:1}] },
  { id: 20, name: 'DEPREM',             type: 'negative',    emoji: '🌍', color: '#c2410c', pos: [6,4],  desc: 'Deprem → -1 Sağlık', getEffect: () => [{stat:'saglik',change:-1}] },
  { id: 21, name: 'İŞTEN\nÇIKARILDIN', type: 'obstacle',    emoji: '🚪', color: '#991b1b', pos: [6,3],  desc: 'İşten çıkarıldın → -2 Para', isObstacle: true, getEffect: () => [{stat:'para',change:-2}] },
  { id: 22, name: 'AİLE BASKISI',       type: 'obstacle',    emoji: '👪', color: '#b91c1c', pos: [6,2],  desc: 'Aile baskısı → -1 Eğitim', isObstacle: true, getEffect: () => [{stat:'egitim',change:-1}] },

  // BOTTOM-LEFT CORNER
  { id: 23, name: 'SİSTEM',             type: 'system_draw', emoji: '⚙️', color: '#6d28d9', pos: [6,1],  desc: 'Sistem kartı çek — herkesi etkiler!', getEffect: () => [] },

  // LEFT SIDE bottom→top
  { id: 24, name: 'PSİKOLOJİK\nDAYANIKLILIK', type: 'special', emoji: '🧠', color: '#7c3aed', pos: [5,1], desc: 'Psikoloji ≥3 ise +1, aksi hâlde 1 tur atla', getEffect: (p) => p.stats.psikoloji >= 3 ? [{stat:'psikoloji',change:1}] : [] },
  { id: 25, name: 'STAJ',               type: 'opportunity', emoji: '📋', color: '#16a34a', pos: [4,1],  desc: 'Staj yaptın → +1 Eğitim, +1 Sosyal Hak', getEffect: () => [{stat:'egitim',change:1},{stat:'sosyalHak',change:1}] },
  { id: 26, name: 'SAĞLIK',             type: 'opportunity', emoji: '💊', color: '#15803d', pos: [3,1],  desc: 'Sağlık hizmeti → +1 Sağlık', getEffect: () => [{stat:'saglik',change:1}] }
];

// ============================================================
// SERVER STATE
// ============================================================

const rooms = {};

function genCode() {
  return Math.random().toString(36).substr(2, 5).toUpperCase();
}

function clamp(val, min = 0, max = 8) {
  return Math.max(min, Math.min(max, val));
}

function broadcast(room, msg) {
  const json = JSON.stringify(msg);
  room.players.forEach(p => {
    if (p.ws && p.ws.readyState === WebSocket.OPEN) {
      p.ws.send(json);
    }
  });
}

function sendTo(ws, msg) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
}

function shuffleDeck() {
  const deck = [...SYSTEM_CARDS];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function getPublicPlayers(room) {
  return room.players.map(p => ({
    id: p.id,
    name: p.name,
    character: p.character,
    position: p.position,
    stats: p.stats,
    turnsLeft: p.turnsLeft,
    obstacleCount: p.obstacleCount,
    skipTurns: p.skipTurns,
    skipReason: p.skipReason,
    lapsCompleted: p.lapsCompleted,
    finished: p.finished
  }));
}

function applyEffects(player, effects) {
  const applied = [];
  effects.forEach(e => {
    if (e.change !== 0) {
      const oldVal = player.stats[e.stat];
      player.stats[e.stat] = clamp(oldVal + e.change);
      applied.push({ stat: e.stat, change: e.change, from: oldVal, to: player.stats[e.stat] });
    }
  });
  return applied;
}

function checkZeroStatPenalties(player) {
  const reasons = [];
  if (player.stats.saglik <= 0) {
    player.stats.saglik = 0;
    if (player.skipTurns < 2) {
      player.skipTurns = 2;
      player.skipReason = '💀 Sağlık sıfır — 2 tur bekliyorsun';
      reasons.push('saglik_zero');
    }
  }
  if (player.stats.psikoloji <= 0) {
    player.stats.psikoloji = 0;
    if (player.skipTurns < 1) {
      player.skipTurns = 1;
      player.skipReason = '😵 Psikoloji sıfır — 1 tur bekliyorsun';
      reasons.push('psikoloji_zero');
    }
  }
  if (player.stats.sosyalHak <= 0) {
    player.stats.sosyalHak = 0;
    if (player.skipTurns < 1) {
      player.skipTurns = 1;
      player.skipReason = '🚫 Sosyal Hak sıfır — 1 tur bekliyorsun';
      reasons.push('sosyalhak_zero');
    }
  }
  return reasons;
}

function advanceToNextPlayer(room) {
  const n = room.players.length;
  let tries = 0;
  do {
    room.currentPlayerIndex = (room.currentPlayerIndex + 1) % n;
    if (room.currentPlayerIndex === 0) room.globalRound++;
    tries++;
  } while (
    room.players[room.currentPlayerIndex].turnsLeft <= 0 &&
    tries < n + 1
  );
}

function calcScore(player) {
  const s = player.stats;
  return (s.para || 0) + (s.egitim || 0) + (s.saglik || 0) + (s.sosyalHak || 0) + (s.psikoloji || 0) - player.obstacleCount;
}

function checkGameOver(room) {
  const allDone = room.players.every(p => p.turnsLeft <= 0);
  if (allDone || room.globalRound > room.maxRounds) {
    room.gameState = 'finished';
    const scores = room.players.map(p => ({
      id: p.id,
      name: p.name,
      character: p.character,
      startStats: p.startStats,
      stats: p.stats,
      obstacleCount: p.obstacleCount,
      lapsCompleted: p.lapsCompleted,
      score: calcScore(p)
    })).sort((a, b) => b.score - a.score);

    broadcast(room, { type: 'game_over', scores });
    return true;
  }
  return false;
}

// ============================================================
// WEBSOCKET
// ============================================================

wss.on('connection', (ws) => {
  const playerId = uuidv4();
  let currentRoom = null;

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    switch (msg.type) {

      // ---- CREATE ROOM ----
      case 'create_room': {
        let code;
        do { code = genCode(); } while (rooms[code]);

        const room = {
          code,
          hostId: playerId,
          players: [],
          gameState: 'waiting', // waiting | playing | finished
          currentPlayerIndex: 0,
          globalRound: 1,
          maxRounds: 12,
          systemDeck: shuffleDeck()
        };
        rooms[code] = room;
        currentRoom = room;

        const player = {
          id: playerId, name: msg.name, ws,
          character: null, position: 0,
          stats: null, startStats: null,
          turnsLeft: 0, obstacleCount: 0,
          skipTurns: 0, skipReason: '',
          lapsCompleted: 0, finished: false
        };
        room.players.push(player);

        sendTo(ws, {
          type: 'room_joined', roomCode: code,
          playerId, isHost: true,
          players: getPublicPlayers(room)
        });
        break;
      }

      // ---- JOIN ROOM ----
      case 'join_room': {
        const code = msg.code?.toUpperCase();
        const room = rooms[code];
        if (!room) { sendTo(ws, { type: 'error', message: 'Oda bulunamadı! Kodu kontrol et.' }); return; }
        if (room.gameState === 'playing') { sendTo(ws, { type: 'error', message: 'Oyun zaten başladı!' }); return; }
        if (room.players.length >= 6) { sendTo(ws, { type: 'error', message: 'Oda dolu! (Max 6 oyuncu)' }); return; }

        currentRoom = room;
        const player = {
          id: playerId, name: msg.name, ws,
          character: null, position: 0,
          stats: null, startStats: null,
          turnsLeft: 0, obstacleCount: 0,
          skipTurns: 0, skipReason: '',
          lapsCompleted: 0, finished: false
        };
        room.players.push(player);

        sendTo(ws, {
          type: 'room_joined', roomCode: code,
          playerId, isHost: false,
          players: getPublicPlayers(room)
        });
        broadcast(room, {
          type: 'player_joined',
          players: getPublicPlayers(room)
        });
        break;
      }

      // ---- SELECT CHARACTER ----
      case 'select_character': {
        if (!currentRoom) return;
        const player = currentRoom.players.find(p => p.id === playerId);
        if (!player) return;
        if (!CHARACTERS[msg.character]) { sendTo(ws, { type: 'error', message: 'Geçersiz karakter!' }); return; }

        const taken = currentRoom.players.some(p => p.id !== playerId && p.character === msg.character);
        if (taken) { sendTo(ws, { type: 'error', message: 'Bu karakter zaten seçildi!' }); return; }

        player.character = msg.character;
        broadcast(currentRoom, {
          type: 'character_selected',
          playerId, character: msg.character,
          players: getPublicPlayers(currentRoom)
        });
        break;
      }

      // ---- START GAME (host only) ----
      case 'start_game': {
        if (!currentRoom || currentRoom.hostId !== playerId) return;
        if (currentRoom.gameState !== 'waiting') return;
        if (currentRoom.players.length < 1) { sendTo(ws, { type: 'error', message: 'En az 1 oyuncu gerekli!' }); return; }
        const noChar = currentRoom.players.some(p => !p.character);
        if (noChar) { sendTo(ws, { type: 'error', message: 'Tüm oyuncular karakter seçmeli!' }); return; }

        currentRoom.gameState = 'playing';
        currentRoom.currentPlayerIndex = 0;
        currentRoom.globalRound = 1;
        currentRoom.maxRounds = 12;

        currentRoom.players.forEach(p => {
          const base = CHARACTERS[p.character].stats;
          p.stats = { ...base };
          p.startStats = { ...base };
          p.turnsLeft = 12;
          p.position = 0;
          p.obstacleCount = 0;
          p.skipTurns = 0;
          p.lapsCompleted = 0;
        });

        broadcast(currentRoom, {
          type: 'game_started',
          currentPlayer: currentRoom.players[0].id,
          round: 1,
          maxRounds: 12,
          players: getPublicPlayers(currentRoom)
        });
        break;
      }

      // ---- ROLL DICE ----
      case 'roll_dice': {
        if (!currentRoom || currentRoom.gameState !== 'playing') return;
        const curP = currentRoom.players[currentRoom.currentPlayerIndex];
        if (!curP || curP.id !== playerId) return;

        const events = [];

        // Skip turn check
        if (curP.skipTurns > 0) {
          const reason = curP.skipReason;
          curP.skipTurns--;
          curP.turnsLeft--;
          if (curP.turnsLeft <= 0) curP.finished = true;

          events.push({ type: 'skip', reason });
          advanceToNextPlayer(currentRoom);
          if (checkGameOver(currentRoom)) return;

          broadcast(currentRoom, {
            type: 'turn_skipped',
            playerId, reason,
            currentPlayer: currentRoom.players[currentRoom.currentPlayerIndex].id,
            round: currentRoom.globalRound,
            players: getPublicPlayers(currentRoom)
          });
          return;
        }

        // Roll dice
        const dice = Math.floor(Math.random() * 6) + 1;
        const oldPosition = curP.position;
        const newPosition = (oldPosition + dice) % 27;

        // Track laps
        if (newPosition < oldPosition) {
          curP.lapsCompleted++;
        }
        curP.position = newPosition;
        curP.turnsLeft--;

        const square = SQUARES[newPosition];
        let squareEffects = [];
        let systemCard = null;
        let systemEffects = {}; // playerId → applied effects

        if (square.type === 'system_draw') {
          // Draw system card — affects all
          if (currentRoom.systemDeck.length === 0) {
            currentRoom.systemDeck = shuffleDeck();
          }
          systemCard = currentRoom.systemDeck.pop();
          currentRoom.players.forEach(p => {
            const eff = systemCard.getEffect(p);
            const applied = applyEffects(p, eff);
            systemEffects[p.id] = applied;
            checkZeroStatPenalties(p);
          });
        } else if (square.type === 'special' && square.id === 24) {
          // PSİKOLOJİK DAYANIKLILIK
          const eff = square.getEffect(curP);
          squareEffects = applyEffects(curP, eff);
          if (curP.stats.psikoloji < 3 && curP.stats.psikoloji > 0) {
            curP.skipTurns = Math.max(curP.skipTurns, 1);
            curP.skipReason = '🧠 Psikolojik test başarısız — 1 tur atla';
            events.push({ type: 'skip_next', reason: curP.skipReason });
          }
          checkZeroStatPenalties(curP);
        } else {
          const eff = square.getEffect ? square.getEffect(curP) : [];
          squareEffects = applyEffects(curP, eff);
          if (square.isObstacle) curP.obstacleCount++;
          checkZeroStatPenalties(curP);
        }

        if (curP.turnsLeft <= 0) curP.finished = true;

        advanceToNextPlayer(currentRoom);
        if (checkGameOver(currentRoom)) return;

        broadcast(currentRoom, {
          type: 'dice_rolled',
          playerId,
          dice,
          oldPosition,
          newPosition,
          square: {
            id: square.id,
            name: square.name.replace('\n', ' '),
            type: square.type,
            emoji: square.emoji,
            color: square.color,
            desc: square.desc
          },
          squareEffects,
          systemCard: systemCard ? {
            id: systemCard.id,
            name: systemCard.name,
            emoji: systemCard.emoji,
            description: systemCard.description,
            color: systemCard.color
          } : null,
          systemEffects,
          currentPlayer: currentRoom.players[currentRoom.currentPlayerIndex].id,
          round: currentRoom.globalRound,
          players: getPublicPlayers(currentRoom)
        });
        break;
      }

    } // end switch
  });

  ws.on('close', () => {
    if (!currentRoom) return;
    currentRoom.players = currentRoom.players.filter(p => p.id !== playerId);
    if (currentRoom.players.length === 0) {
      delete rooms[currentRoom.code];
      return;
    }
    if (currentRoom.hostId === playerId) {
      currentRoom.hostId = currentRoom.players[0].id;
    }
    // If it was this player's turn, advance
    if (currentRoom.gameState === 'playing') {
      const idx = currentRoom.currentPlayerIndex;
      if (idx >= currentRoom.players.length) {
        currentRoom.currentPlayerIndex = 0;
      }
    }
    broadcast(currentRoom, {
      type: 'player_left',
      playerId,
      players: getPublicPlayers(currentRoom)
    });
  });
});

server.listen(PORT, () => {
  console.log(`\n🎲 Not A Fair Game — sunucu başladı!`);
  console.log(`🌐 http://localhost:${PORT}\n`);
});
