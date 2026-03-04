// ============================================================
// NOT A FAIR GAME — Client
// ============================================================

const CHARACTERS = {
  kirsal_kiz:   { name: 'Kırsal Bölge Kız Öğrenci', emoji: '👧', cardIcon: 'user',          color: '#f472b6', stats: { para:1, egitim:1, saglik:2, sosyalHak:1, psikoloji:2 } },
  sehirli_erkek:{ name: 'Şehirli Erkek Öğrenci',    emoji: '🧑', cardIcon: 'user-round',    color: '#60a5fa', stats: { para:3, egitim:3, saglik:3, sosyalHak:3, psikoloji:3 } },
  gocmen_isci:  { name: 'Göçmen İşçi',              emoji: '👷', cardIcon: 'hard-hat',      color: '#fb923c', stats: { para:1, egitim:2, saglik:2, sosyalHak:1, psikoloji:3 } },
  ust_sinif:    { name: 'Üst Sınıf Çocuk',          emoji: '👑', cardIcon: 'crown',         color: '#fbbf24', stats: { para:5, egitim:4, saglik:5, sosyalHak:4, psikoloji:4 } },
  engelli:      { name: 'Engelli Birey',             emoji: '♿', cardIcon: 'accessibility', color: '#a78bfa', stats: { para:2, egitim:2, saglik:1, sosyalHak:1, psikoloji:3 } },
  tek_ebeveyn:  { name: 'Tek Ebeveynli Çocuk',      emoji: '🧒', cardIcon: 'baby',          color: '#34d399', stats: { para:2, egitim:2, saglik:3, sosyalHak:2, psikoloji:2 } }
};

const STAT_META = {
  para:      { label: 'Para',       icon: 'coins',       cls: 'stat-para' },
  egitim:    { label: 'Eğitim',     icon: 'book-open',   cls: 'stat-egitim' },
  saglik:    { label: 'Sağlık',     icon: 'heart-pulse', cls: 'stat-saglik' },
  sosyalHak: { label: 'Sosyal Hak', icon: 'scale',       cls: 'stat-sosyalHak' },
  psikoloji: { label: 'Psikoloji',  icon: 'brain',       cls: 'stat-psikoloji' }
};

const SQUARES = [
  { id:0,  name:'BAŞLANGIÇ',      type:'start',       icon:'flag',           color:'#22c55e', pos:[1,1],  eff:'' },
  { id:1,  name:'BURS',           type:'opportunity', icon:'graduation-cap', color:'#16a34a', pos:[1,2],  eff:'Para≤1→+3 Eğt, diğer +1' },
  { id:2,  name:'MENTOR',         type:'opportunity', icon:'handshake',      color:'#15803d', pos:[1,3],  eff:'+2 Eğitim' },
  { id:3,  name:'İŞ FIRSATI',     type:'opportunity', icon:'briefcase',      color:'#16a34a', pos:[1,4],  eff:'+2 Para' },
  { id:4,  name:'EKONOMİK KRİZ', type:'negative',    icon:'trending-down',  color:'#ea580c', pos:[1,5],  eff:'-1 Para' },
  { id:5,  name:'EĞİTİM REFORMU',type:'conditional', icon:'book-open',      color:'#ca8a04', pos:[1,6],  eff:'Eğt≥2→+1' },
  { id:6,  name:'AYRIMCILIK',     type:'obstacle',    icon:'ban',            color:'#dc2626', pos:[1,7],  eff:'-1 Sos.Hak' },
  { id:7,  name:'SAĞLIK SORUNU', type:'obstacle',    icon:'stethoscope',    color:'#b91c1c', pos:[1,8],  eff:'-2 Sağlık' },
  { id:8,  name:'MADDİ\nYET.',   type:'obstacle',    icon:'banknote-x',     color:'#991b1b', pos:[1,9],  eff:'-2 Para' },
  { id:9,  name:'SOSYAL HAKLAR', type:'corner',      icon:'scale',          color:'#1d4ed8', pos:[1,10], eff:'+1 Sos.Hak' },
  { id:10, name:'SOSYAL PROJE',  type:'opportunity', icon:'hand-heart',     color:'#2563eb', pos:[2,10], eff:'+1 Sh +1 Psi' },
  { id:11, name:'GİRİŞİM\nDEST.',type:'opportunity', icon:'rocket',         color:'#16a34a', pos:[3,10], eff:'+3 Para' },
  { id:12, name:'TERFİ',         type:'opportunity', icon:'trending-up',    color:'#15803d', pos:[4,10], eff:'+3 Para' },
  { id:13, name:'PANDEMİ',       type:'obstacle',    icon:'biohazard',      color:'#7f1d1d', pos:[5,10], eff:'-1 Para -1 Sğ' },
  { id:14, name:'BİTİŞ\nADALET',type:'end',         icon:'landmark',       color:'#b45309', pos:[6,10], eff:'Tüm +1' },
  { id:15, name:'NETWORK',       type:'opportunity', icon:'network',        color:'#16a34a', pos:[6,9],  eff:'+2 Sos.Hak' },
  { id:16, name:'BAŞARI',        type:'opportunity', icon:'trophy',         color:'#15803d', pos:[6,8],  eff:'+2 Eğitim' },
  { id:17, name:'TASARRUF',      type:'opportunity', icon:'piggy-bank',     color:'#a16207', pos:[6,7],  eff:'+1 Para +1 Psi' },
  { id:18, name:'KRİZ',          type:'negative',    icon:'chart-no-axes-decreasing', color:'#c2410c', pos:[6,6],  eff:'-1 Para' },
  { id:19, name:'SOSYAL YARDIM', type:'opportunity', icon:'life-buoy',      color:'#166534', pos:[6,5],  eff:'Para≤1→+2, diğer +1' },
  { id:20, name:'DEPREM',        type:'negative',    icon:'mountain',       color:'#c2410c', pos:[6,4],  eff:'-1 Sağlık' },
  { id:21, name:'İŞTEN\nÇIK.',  type:'obstacle',    icon:'door-open',      color:'#991b1b', pos:[6,3],  eff:'-2 Para' },
  { id:22, name:'AİLE BASKISI', type:'obstacle',    icon:'users',          color:'#b91c1c', pos:[6,2],  eff:'-1 Eğitim' },
  { id:23, name:'SİSTEM',        type:'system_draw', icon:'cog',            color:'#6d28d9', pos:[6,1],  eff:'Kart çek!' },
  { id:24, name:'PSİKOLOJİK\nDAY.', type:'special', icon:'brain',          color:'#7c3aed', pos:[5,1],  eff:'Psi≥3→+1, yoksa 1 tur atla' },
  { id:25, name:'STAJ',          type:'opportunity', icon:'clipboard-list', color:'#16a34a', pos:[4,1],  eff:'+1 Eğt +1 Sh' },
  { id:26, name:'SAĞLIK',        type:'opportunity', icon:'pill',           color:'#15803d', pos:[3,1],  eff:'+1 Sağlık' }
];

const DICE_FACES = ['⚀','⚁','⚂','⚃','⚄','⚅'];

// ── Icon helpers ──────────────────────────────────────────────
function icon(name, cls = '') {
  return `<i data-lucide="${name}" class="lucide-icon ${cls}"></i>`;
}
function refreshIcons() {
  if (window.lucide) lucide.createIcons();
}
// Kare için icon — server'dan gelen msg.square.id üzerinden client SQUARES'a bak
function squareIcon(squareId, color) {
  const sq = SQUARES.find(s => s.id === squareId);
  const name = sq?.icon || 'circle';
  return `<i data-lucide="${name}" class="sq-modal-icon" style="color:${color || '#fff'}"></i>`;
}

// ============================================================
// APP STATE
// ============================================================
const STATE = {
  ws: null,
  playerId: null,
  roomCode: null,
  isHost: false,
  players: [],
  gameState: 'lobby',
  currentPlayer: null,
  round: 1,
  maxRounds: 12,
  lastEvent: null
};

// ============================================================
// WS CONNECT
// ============================================================
function connectWS() {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  STATE.ws = new WebSocket(`${proto}://${location.host}`);

  STATE.ws.onmessage = (e) => {
    try { handleMessage(JSON.parse(e.data)); } catch(err) { console.error(err); }
  };

  STATE.ws.onclose = () => {
    setTimeout(() => {
      if (STATE.gameState !== 'lobby') {
        showError('Bağlantı kesildi! Sayfa yenileniyor...', 'lobby');
        setTimeout(() => location.reload(), 2000);
      }
    }, 500);
  };

  STATE.ws.onerror = (e) => console.error('WS error', e);
}

function send(obj) {
  if (STATE.ws && STATE.ws.readyState === WebSocket.OPEN) {
    STATE.ws.send(JSON.stringify(obj));
  }
}

// ============================================================
// MESSAGE HANDLER
// ============================================================
function handleMessage(msg) {
  switch (msg.type) {

    case 'room_joined':
      STATE.playerId  = msg.playerId;
      STATE.roomCode  = msg.roomCode;
      STATE.isHost    = msg.isHost;
      STATE.players   = msg.players;
      showScreen('waiting');
      renderWaiting();
      break;

    case 'player_joined':
    case 'character_selected':
      STATE.players = msg.players;
      renderWaiting();
      break;

    case 'player_left':
      STATE.players = msg.players;
      if (STATE.gameState === 'waiting') renderWaiting();
      else if (STATE.gameState === 'playing') renderPlayerStats();
      break;

    case 'game_started':
      STATE.gameState    = 'playing';
      STATE.currentPlayer = msg.currentPlayer;
      STATE.round        = msg.round;
      STATE.maxRounds    = msg.maxRounds;
      STATE.players      = msg.players;
      showScreen('game');
      buildBoard();
      renderGameState();
      break;

    case 'dice_rolled':
      STATE.players       = msg.players;
      STATE.currentPlayer = msg.currentPlayer;
      STATE.round         = msg.round;
      handleDiceRolled(msg);
      break;

    case 'turn_skipped':
      STATE.players       = msg.players;
      STATE.currentPlayer = msg.currentPlayer;
      STATE.round         = msg.round;
      handleTurnSkipped(msg);
      break;

    case 'game_over':
      STATE.gameState = 'finished';
      showGameOver(msg.scores);
      break;

    case 'error':
      showError(msg.message, STATE.gameState);
      break;
  }
}

// ============================================================
// SCREEN MANAGEMENT
// ============================================================
function showScreen(name) {
  STATE.gameState = name;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(`screen-${name}`).classList.add('active');
}

function showError(msg, screen) {
  const el = document.getElementById(`${screen}-error`) || document.getElementById('lobby-error');
  if (el) {
    el.textContent = msg;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 4000);
  }
}

// ============================================================
// LOBBY
// ============================================================
document.getElementById('btn-create').addEventListener('click', () => {
  const name = document.getElementById('player-name').value.trim();
  if (!name) { showError('Önce adını gir!', 'lobby'); return; }
  send({ type: 'create_room', name });
});

document.getElementById('btn-join').addEventListener('click', () => {
  const name = document.getElementById('player-name').value.trim();
  const code = document.getElementById('room-code-input').value.trim().toUpperCase();
  if (!name) { showError('Önce adını gir!', 'lobby'); return; }
  if (!code)  { showError('Oda kodunu gir!', 'lobby'); return; }
  send({ type: 'join_room', name, code });
});

document.getElementById('player-name').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('btn-create').click();
});
document.getElementById('room-code-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('btn-join').click();
});

// ============================================================
// WAITING ROOM
// ============================================================
function renderWaiting() {
  document.getElementById('display-room-code').textContent = STATE.roomCode;

  // Character grid
  const grid = document.getElementById('character-grid');
  grid.innerHTML = '';
  Object.entries(CHARACTERS).forEach(([key, ch]) => {
    const taken     = STATE.players.some(p => p.character === key && p.id !== STATE.playerId);
    const isMine    = STATE.players.find(p => p.id === STATE.playerId)?.character === key;
    const takenBy   = STATE.players.find(p => p.character === key && p.id !== STATE.playerId);

    const card = document.createElement('div');
    card.className = `char-card${taken ? ' taken' : ''}${isMine ? ' mine selected' : ''}`;
    card.innerHTML = `
      ${taken ? `<div class="taken-badge">${takenBy?.name || 'Alındı'}</div>` : ''}
      <div class="char-avatar" style="--char-color:${ch.color}">
        <i data-lucide="${ch.cardIcon}" class="char-avatar-icon"></i>
      </div>
      <div class="char-name">${ch.name}</div>
      <div class="char-stats">
        ${Object.entries(ch.stats).map(([stat,val]) => `
          <span class="stat-badge ${val >= 4 ? 'high' : val <= 1 ? 'low' : ''}">
            <i data-lucide="${STAT_META[stat].icon}" class="stat-badge-icon"></i>${val}
          </span>
        `).join('')}
      </div>
    `;

    if (!taken) {
      card.addEventListener('click', () => send({ type: 'select_character', character: key }));
    }
    grid.appendChild(card);
  });

  // Player list
  const list = document.getElementById('waiting-player-list');
  list.innerHTML = STATE.players.map(p => {
    const ch = p.character ? CHARACTERS[p.character] : null;
    return `
      <div class="player-chip ${ch ? 'ready' : ''}">
        <span class="chip-emoji">${ch ? ch.emoji : '❓'}</span>
        <span>${p.name}${p.id === STATE.playerId ? ' (sen)' : ''}${p.character ? '' : ' — seçmiyor'}</span>
      </div>
    `;
  }).join('');

  // Host controls
  const btnStart  = document.getElementById('btn-start');
  const hostNote  = document.getElementById('host-note');
  if (STATE.isHost) {
    btnStart.classList.remove('hidden');
    hostNote.classList.remove('hidden');
    const allReady = STATE.players.every(p => p.character);
    btnStart.disabled = !allReady;
    hostNote.textContent = allReady
      ? '✅ Herkes hazır! Başlatabilirsin.'
      : 'Tüm oyuncular karakter seçince başlatabilirsin.';
  }
  refreshIcons();
}

document.getElementById('btn-copy-code').addEventListener('click', () => {
  navigator.clipboard.writeText(STATE.roomCode).then(() => {
    document.getElementById('btn-copy-code').textContent = '✅';
    setTimeout(() => { document.getElementById('btn-copy-code').textContent = '📋'; }, 1500);
  });
});

document.getElementById('btn-start').addEventListener('click', () => {
  send({ type: 'start_game' });
});

// ============================================================
// BOARD BUILD
// ============================================================
function buildBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';

  // Center
  const center = document.createElement('div');
  center.className = 'board-center';
  center.style.gridRow    = '2 / 6';
  center.style.gridColumn = '2 / 10';
  center.innerHTML = `
    <div class="board-center-scales">⚖️</div>
    <div class="board-center-title">NOT A<br>FAIR GAME</div>
    <div class="board-center-sub">ADALET</div>
  `;
  board.appendChild(center);

  // Squares
  SQUARES.forEach(sq => {
    const el = document.createElement('div');
    el.className = `square sq-${sq.type}`;
    el.id = `square-${sq.id}`;
    el.style.gridRow    = sq.pos[0];
    el.style.gridColumn = sq.pos[1];
    el.style.borderColor = sq.color + '55';
    el.style.background  = sq.color + '22';
    el.title = sq.name.replace('\n', ' ') + (sq.eff ? ' → ' + sq.eff : '');

    el.innerHTML = `
      <span class="square-icon-wrap">
        <i data-lucide="${sq.icon}" class="square-svg-icon" style="color:${sq.color}"></i>
      </span>
      <span class="square-name">${sq.name}</span>
      <div class="tokens-wrap" id="tokens-sq-${sq.id}"></div>
    `;
    board.appendChild(el);
  });

  refreshIcons();
  // Place tokens initially
  updateTokenPositions(STATE.players);
}

function updateTokenPositions(players) {
  // Clear all token slots
  document.querySelectorAll('.tokens-wrap').forEach(w => w.innerHTML = '');

  // Group by position
  const grouped = {};
  players.forEach(p => {
    if (!grouped[p.position]) grouped[p.position] = [];
    grouped[p.position].push(p);
  });

  Object.entries(grouped).forEach(([pos, plist]) => {
    const wrap = document.getElementById(`tokens-sq-${pos}`);
    if (!wrap) return;
    plist.forEach(p => {
      const ch = CHARACTERS[p.character];
      if (!ch) return;
      const token = document.createElement('div');
      token.className = 'token';
      token.id = `token-${p.id}`;
      token.textContent = ch.emoji;
      token.style.background = ch.color;
      token.style.color = '#fff';
      token.title = p.name;
      if (p.id === STATE.playerId) token.style.border = '2px solid white';
      wrap.appendChild(token);
    });
  });
}

// ============================================================
// GAME STATE RENDER
// ============================================================
function renderGameState() {
  // Highlight active square
  document.querySelectorAll('.square').forEach(s => s.classList.remove('active-square'));
  const curPlayer = STATE.players.find(p => p.id === STATE.currentPlayer);
  if (curPlayer) {
    const sq = document.getElementById(`square-${curPlayer.position}`);
    if (sq) sq.classList.add('active-square');
  }

  updateTokenPositions(STATE.players);
  renderPlayerStats();
  renderMyStats();
  renderTurnBadge();
  updateDiceButton();
}

function renderTurnBadge() {
  const badge = document.getElementById('turn-badge');
  const roundInfo = document.getElementById('round-info');
  const curPlayer = STATE.players.find(p => p.id === STATE.currentPlayer);

  if (!curPlayer) { badge.textContent = '...'; return; }

  const ch = CHARACTERS[curPlayer.character];
  const isMe = curPlayer.id === STATE.playerId;

  badge.textContent = isMe
    ? `🎯 Senin sıran! ${ch?.emoji || ''}`
    : `⏳ ${curPlayer.name} oynuyor ${ch?.emoji || ''}`;
  badge.style.color = isMe ? '#86efac' : 'var(--accent)';

  roundInfo.textContent = `Tur ${STATE.round} / ${STATE.maxRounds}`;
}

function renderPlayerStats() {
  const list = document.getElementById('player-stats-list');
  list.innerHTML = '';

  STATE.players.forEach(p => {
    const ch = CHARACTERS[p.character];
    if (!ch) return;
    const isActive = p.id === STATE.currentPlayer;
    const isMe = p.id === STATE.playerId;

    const item = document.createElement('div');
    item.className = `ps-item${isActive ? ' active-player' : ''}${isMe ? ' my-player' : ''}`;
    item.innerHTML = `
      <div class="ps-header">
        <span class="ps-emoji">${ch.emoji}</span>
        <span class="ps-name">${p.name}${isMe ? ' 👤' : ''}</span>
        <span class="ps-pos">📍${p.position}</span>
      </div>
      <div class="ps-stats">
        ${Object.entries(STAT_META).map(([key, m]) => {
          const val = p.stats?.[key] ?? 0;
          const pct = Math.min(100, (val / 8) * 100);
          return `
            <div class="ps-stat-row">
              <span class="ps-stat-label">
                <i data-lucide="${m.icon}" class="lucide-icon ps-stat-icon ${m.cls}-icon"></i>
                ${key === 'sosyalHak' ? 'S.Hak' : m.label}
              </span>
              <div class="ps-stat-bar"><div class="ps-stat-fill ${m.cls}" style="width:${pct}%"></div></div>
              <span class="ps-stat-val">${val}</span>
            </div>
          `;
        }).join('')}
      </div>
      <div class="ps-turn-left">Kalan tur: ${p.turnsLeft} | Engel: ${p.obstacleCount}</div>
      ${p.skipTurns > 0 ? `<div class="ps-skip">⏸ ${p.skipReason || 'Tur atlandı'} (${p.skipTurns} tur)</div>` : ''}
    `;
    list.appendChild(item);
  });
  refreshIcons();
}

function renderMyStats() {
  const me = STATE.players.find(p => p.id === STATE.playerId);
  if (!me || !me.stats) return;

  const container = document.getElementById('my-stats');
  container.innerHTML = Object.entries(STAT_META).map(([key, m]) => {
    const val = me.stats[key] ?? 0;
    const pct = Math.min(100, (val / 8) * 100);
    return `
      <div class="my-stat-row">
        <span class="my-stat-icon">
          <i data-lucide="${m.icon}" class="lucide-icon my-stat-lucide ${m.cls}-icon"></i>
        </span>
        <div class="my-stat-info">
          <div class="my-stat-name">${m.label}</div>
          <div class="my-stat-bar"><div class="my-stat-fill ${m.cls}" style="width:${pct}%"></div></div>
        </div>
        <span class="my-stat-val">${val}</span>
      </div>
    `;
  }).join('');
  refreshIcons();
}

function updateDiceButton() {
  const btn = document.getElementById('btn-roll');
  const note = document.getElementById('my-turn-note');
  const isMyTurn = STATE.currentPlayer === STATE.playerId;
  const me = STATE.players.find(p => p.id === STATE.playerId);
  const finished = me?.turnsLeft <= 0;

  btn.disabled = !isMyTurn || finished;

  if (finished) {
    note.textContent = '✅ Turların bitti!';
    note.className = 'turn-note';
  } else if (isMyTurn) {
    note.textContent = '🎯 Senin sıran — zar at!';
    note.className = 'turn-note my-turn';
    // Mobilde dice butonuna scroll
    if (window.innerWidth <= 860) {
      setTimeout(() => {
        document.getElementById('btn-roll')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
    }
  } else {
    const curPlayer = STATE.players.find(p => p.id === STATE.currentPlayer);
    note.textContent = curPlayer
      ? `⏳ ${curPlayer.name} oynuyor...`
      : '';
    note.className = 'turn-note';
  }
}

// ============================================================
// DICE ROLL
// ============================================================
document.getElementById('btn-roll').addEventListener('click', () => {
  document.getElementById('btn-roll').disabled = true;
  send({ type: 'roll_dice' });
  animateDice();
});

function animateDice(finalFace = null) {
  const dice = document.getElementById('dice');
  dice.classList.add('rolling');

  let count = 0;
  const interval = setInterval(() => {
    const face = DICE_FACES[Math.floor(Math.random() * 6)];
    dice.querySelector('.face').textContent = face;
    count++;
    if (count > 10 && finalFace !== null) {
      clearInterval(interval);
      dice.querySelector('.face').textContent = DICE_FACES[finalFace - 1];
      setTimeout(() => dice.classList.remove('rolling'), 100);
    } else if (count > 14 && finalFace === null) {
      clearInterval(interval);
      dice.classList.remove('rolling');
    }
  }, 60);

  return interval;
}

// ============================================================
// HANDLE DICE ROLLED
// ============================================================
function handleDiceRolled(msg) {
  // Animate dice to final value
  const dice = document.getElementById('dice');
  dice.classList.add('rolling');
  let count = 0;
  const interval = setInterval(() => {
    const face = DICE_FACES[Math.floor(Math.random() * 6)];
    dice.querySelector('.face').textContent = face;
    count++;
    if (count >= 8) {
      clearInterval(interval);
      dice.querySelector('.face').textContent = DICE_FACES[msg.dice - 1];
      setTimeout(() => dice.classList.remove('rolling'), 100);
    }
  }, 60);

  document.getElementById('dice-value').textContent = `${msg.dice} geldi!`;

  // Move token with delay
  setTimeout(() => {
    // Mobilde tahtayı göster
    if (window.innerWidth <= 860) {
      document.querySelector('.board-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    // Update state
    renderGameState();

    // Highlight new square
    document.querySelectorAll('.square').forEach(s => s.classList.remove('active-square'));
    const movedPlayer = STATE.players.find(p => p.id === msg.playerId);
    if (movedPlayer) {
      const sq = document.getElementById(`square-${movedPlayer.position}`);
      if (sq) {
        sq.classList.add('active-square');
        sq.classList.add('flash');
        setTimeout(() => sq.classList.remove('flash'), 400);
      }
    }

    // Log entry
    const pname = STATE.players.find(p => p.id === msg.playerId)?.name || msg.playerId;
    const ch = CHARACTERS[STATE.players.find(p => p.id === msg.playerId)?.character];
    addLog(`${ch?.emoji || ''} ${pname}: ${msg.dice} attı → ${msg.square.name}`, getLogClass(msg));

    // Show effect modal (delayed)
    if (msg.systemCard) {
      setTimeout(() => showSystemModal(msg), 600);
    } else if (msg.squareEffects && msg.squareEffects.length > 0) {
      setTimeout(() => showEffectModal(msg), 600);
    } else if (msg.square.type !== 'start') {
      setTimeout(() => showEffectModal(msg), 600);
    }

    updateDiceButton();
  }, 500);
}

function handleTurnSkipped(msg) {
  const player = STATE.players.find(p => p.id === msg.playerId);
  const name = player?.name || '';
  const ch = CHARACTERS[player?.character] || {};
  addLog(`${ch.emoji || ''} ${name}: ${msg.reason}`, 'skip');
  renderGameState();
}

function getLogClass(msg) {
  const t = msg.square?.type;
  if (['opportunity', 'corner', 'end'].includes(t)) return 'good';
  if (['obstacle'].includes(t)) return 'bad';
  if (t === 'system_draw') return 'system';
  if (msg.squareEffects?.some(e => e.change > 0)) return 'good';
  if (msg.squareEffects?.some(e => e.change < 0)) return 'bad';
  return '';
}

function addLog(text, cls = '') {
  const log = document.getElementById('game-log');
  const entry = document.createElement('div');
  entry.className = `log-entry ${cls}`;
  entry.textContent = text;
  log.insertBefore(entry, log.firstChild);
  // Keep max 30 entries
  while (log.children.length > 30) log.removeChild(log.lastChild);
}

// ============================================================
// EFFECT MODAL
// ============================================================
function showEffectModal(msg) {
  const sq = msg.square;
  const effects = msg.squareEffects || [];

  document.getElementById('modal-emoji').innerHTML = squareIcon(sq.id, sq.color);
  document.getElementById('modal-square-name').textContent = sq.name;
  document.getElementById('modal-desc').textContent = sq.desc || '';

  const effContainer = document.getElementById('modal-effects');
  if (effects.length === 0) {
    effContainer.innerHTML = '<span class="effect-chip neutral">Bu kare etkisi yok</span>';
  } else {
    effContainer.innerHTML = effects.map(e => {
      const m = STAT_META[e.stat];
      const sign = e.change > 0 ? '+' : '';
      const cls = e.change > 0 ? 'positive' : e.change < 0 ? 'negative' : 'neutral';
      return `<span class="effect-chip ${cls}">
        <i data-lucide="${m?.icon || 'circle'}" class="lucide-icon effect-chip-icon"></i>
        ${m ? m.label : e.stat} ${sign}${e.change} (${e.from}→${e.to})
      </span>`;
    }).join('');
  }

  const modal = document.getElementById('effect-card');
  modal.style.borderColor = sq.color || 'var(--border)';

  document.getElementById('effect-modal').classList.remove('hidden');
  refreshIcons();
}

document.getElementById('modal-close').addEventListener('click', () => {
  document.getElementById('effect-modal').classList.add('hidden');
});

// ============================================================
// SYSTEM CARD MODAL
// ============================================================
function showSystemModal(msg) {
  const card = msg.systemCard;
  const effects = msg.systemEffects || {};

  document.getElementById('sys-emoji').innerHTML = `<i data-lucide="cog" class="lucide-icon sys-card-icon"></i>`;
  document.getElementById('sys-name').textContent = card.name;
  document.getElementById('sys-desc').textContent = card.description;

  const grid = document.getElementById('sys-effects-grid');
  grid.innerHTML = STATE.players.map(p => {
    const pEffects = effects[p.id] || [];
    const ch = CHARACTERS[p.character];
    const hasEff = pEffects.length > 0;
    return `
      <div class="sys-effect-row ${hasEff ? 'has-effect' : ''}">
        <div class="player-name">
          <span class="sys-player-token" style="background:${ch?.color || '#555'}">${ch?.emoji || '?'}</span>
          ${p.name}
        </div>
        <div class="effect-line">
          ${hasEff
            ? pEffects.map(e => {
                const m = STAT_META[e.stat];
                const sign = e.change > 0 ? '+' : '';
                return `<span class="${e.change > 0 ? 'eff-pos' : 'eff-neg'}">
                  <i data-lucide="${m?.icon || 'circle'}" class="lucide-icon eff-icon"></i>
                  ${sign}${e.change}
                </span>`;
              }).join(' ')
            : '<span class="eff-neutral">—</span>'}
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('system-modal').classList.remove('hidden');
  refreshIcons();

  // Add to log
  addLog(`⚙️ SİSTEM: ${card.name} — herkesi etkiliyor!`, 'system');
}

document.getElementById('system-modal-close').addEventListener('click', () => {
  document.getElementById('system-modal').classList.add('hidden');
  // Show individual effect if also had square effect
  document.getElementById('effect-modal').classList.add('hidden');
});

// ============================================================
// GAME OVER
// ============================================================
function showGameOver(scores) {
  showScreen('gameover');

  const list = document.getElementById('scores-list');
  list.innerHTML = scores.map((s, i) => {
    const ch = CHARACTERS[s.character];
    const startStats = s.startStats || {};
    const rank = i + 1;
    const rankLabel = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;

    return `
      <div class="score-card rank-${Math.min(rank, 4)}">
        <div class="score-rank">${rankLabel}</div>
        <div class="score-info">
          <div class="score-header">
            <span class="score-emoji">${ch?.emoji || '?'}</span>
            <div class="score-name-wrap">
              <div class="score-player-name">${s.name}</div>
              <div class="score-char-name">${ch?.name || s.character}</div>
            </div>
            <div class="score-total">${s.score}</div>
          </div>
          <div class="score-stats">
            ${Object.entries(STAT_META).map(([key, m]) => {
              const finalVal = s.stats[key] ?? 0;
              const startVal = startStats[key] ?? 0;
              const diff = finalVal - startVal;
              return `
                <div class="score-stat">
                  <i data-lucide="${m.icon}" class="lucide-icon score-stat-icon ${m.cls}-icon"></i>
                  <span class="sval">${finalVal}</span>
                  <span class="sdiff ${diff >= 0 ? 'pos' : 'neg'}">${diff >= 0 ? '+' : ''}${diff}</span>
                </div>
              `;
            }).join('')}
          </div>
          <div class="score-obstacle">
            <i data-lucide="shield-x" class="lucide-icon"></i> ${s.obstacleCount} engel
          </div>
        </div>
      </div>
    `;
  }).join('');
  setTimeout(refreshIcons, 50);
}

document.getElementById('btn-play-again').addEventListener('click', () => {
  location.reload();
});

// ============================================================
// INIT
// ============================================================
connectWS();
