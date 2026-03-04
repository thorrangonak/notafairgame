// ============================================================
// NOT A FAIR GAME — Client
// ============================================================

const CHARACTERS = {
  kirsal_kiz:   { name: 'Kırsal Bölge Kız Öğrenci', emoji: '👧', color: '#f472b6', stats: { para:1, egitim:1, saglik:2, sosyalHak:1, psikoloji:2 } },
  sehirli_erkek:{ name: 'Şehirli Erkek Öğrenci',    emoji: '🧑', color: '#60a5fa', stats: { para:3, egitim:3, saglik:3, sosyalHak:3, psikoloji:3 } },
  gocmen_isci:  { name: 'Göçmen İşçi',              emoji: '👷', color: '#fb923c', stats: { para:1, egitim:2, saglik:2, sosyalHak:1, psikoloji:3 } },
  ust_sinif:    { name: 'Üst Sınıf Çocuk',          emoji: '👑', color: '#fbbf24', stats: { para:5, egitim:4, saglik:5, sosyalHak:4, psikoloji:4 } },
  engelli:      { name: 'Engelli Birey',             emoji: '♿', color: '#a78bfa', stats: { para:2, egitim:2, saglik:1, sosyalHak:1, psikoloji:3 } },
  tek_ebeveyn:  { name: 'Tek Ebeveynli Çocuk',      emoji: '🧒', color: '#34d399', stats: { para:2, egitim:2, saglik:3, sosyalHak:2, psikoloji:2 } }
};

const STAT_META = {
  para:      { label: '💰 Para',       icon: '💰', cls: 'stat-para' },
  egitim:    { label: '📚 Eğitim',     icon: '📚', cls: 'stat-egitim' },
  saglik:    { label: '❤️ Sağlık',     icon: '❤️', cls: 'stat-saglik' },
  sosyalHak: { label: '⚖️ Sosyal Hak', icon: '⚖️', cls: 'stat-sosyalHak' },
  psikoloji: { label: '🧠 Psikoloji',  icon: '🧠', cls: 'stat-psikoloji' }
};

const SQUARES = [
  { id:0,  name:'BAŞLANGIÇ',      type:'start',       emoji:'🏁', color:'#22c55e', pos:[1,1],  eff:'' },
  { id:1,  name:'BURS',           type:'opportunity', emoji:'🎓', color:'#16a34a', pos:[1,2],  eff:'Para≤1→+3 Eğt, diğer +1' },
  { id:2,  name:'MENTOR',         type:'opportunity', emoji:'🤝', color:'#15803d', pos:[1,3],  eff:'+2 Eğitim' },
  { id:3,  name:'İŞ FIRSATI',     type:'opportunity', emoji:'💼', color:'#16a34a', pos:[1,4],  eff:'+2 Para' },
  { id:4,  name:'EKONOMİK KRİZ', type:'negative',    emoji:'📉', color:'#ea580c', pos:[1,5],  eff:'-1 Para' },
  { id:5,  name:'EĞİTİM REFORMU',type:'conditional', emoji:'📖', color:'#ca8a04', pos:[1,6],  eff:'Eğt≥2→+1' },
  { id:6,  name:'AYRIMCILIK',     type:'obstacle',    emoji:'⛔', color:'#dc2626', pos:[1,7],  eff:'-1 Sos.Hak' },
  { id:7,  name:'SAĞLIK SORUNU', type:'obstacle',    emoji:'🏥', color:'#b91c1c', pos:[1,8],  eff:'-2 Sağlık' },
  { id:8,  name:'MADDİ\nYET.',   type:'obstacle',    emoji:'💸', color:'#991b1b', pos:[1,9],  eff:'-2 Para' },
  { id:9,  name:'SOSYAL HAKLAR', type:'corner',      emoji:'⚖️', color:'#1d4ed8', pos:[1,10], eff:'+1 Sos.Hak' },
  { id:10, name:'SOSYAL PROJE',  type:'opportunity', emoji:'🤲', color:'#2563eb', pos:[2,10], eff:'+1 Sh +1 Psi' },
  { id:11, name:'GİRİŞİM\nDEST.',type:'opportunity', emoji:'🚀', color:'#16a34a', pos:[3,10], eff:'+3 Para' },
  { id:12, name:'TERFİ',         type:'opportunity', emoji:'📈', color:'#15803d', pos:[4,10], eff:'+3 Para' },
  { id:13, name:'PANDEMİ',       type:'obstacle',    emoji:'🦠', color:'#7f1d1d', pos:[5,10], eff:'-1 Para -1 Sğ' },
  { id:14, name:'BİTİŞ\nADALET',type:'end',         emoji:'🏛️', color:'#b45309', pos:[6,10], eff:'Tüm +1' },
  { id:15, name:'NETWORK',       type:'opportunity', emoji:'🌐', color:'#16a34a', pos:[6,9],  eff:'+2 Sos.Hak' },
  { id:16, name:'BAŞARI',        type:'opportunity', emoji:'🏆', color:'#15803d', pos:[6,8],  eff:'+2 Eğitim' },
  { id:17, name:'TASARRUF',      type:'opportunity', emoji:'💰', color:'#a16207', pos:[6,7],  eff:'+1 Para +1 Psi' },
  { id:18, name:'KRİZ',          type:'negative',    emoji:'📊', color:'#c2410c', pos:[6,6],  eff:'-1 Para' },
  { id:19, name:'SOSYAL YARDIM', type:'opportunity', emoji:'🆘', color:'#166534', pos:[6,5],  eff:'Para≤1→+2, diğer +1' },
  { id:20, name:'DEPREM',        type:'negative',    emoji:'🌍', color:'#c2410c', pos:[6,4],  eff:'-1 Sağlık' },
  { id:21, name:'İŞTEN\nÇIK.',  type:'obstacle',    emoji:'🚪', color:'#991b1b', pos:[6,3],  eff:'-2 Para' },
  { id:22, name:'AİLE BASKISI', type:'obstacle',    emoji:'👪', color:'#b91c1c', pos:[6,2],  eff:'-1 Eğitim' },
  { id:23, name:'SİSTEM',        type:'system_draw', emoji:'⚙️', color:'#6d28d9', pos:[6,1],  eff:'Kart çek!' },
  { id:24, name:'PSİKOLOJİK\nDAY.', type:'special', emoji:'🧠', color:'#7c3aed', pos:[5,1],  eff:'Psi≥3→+1, yoksa 1 tur atla' },
  { id:25, name:'STAJ',          type:'opportunity', emoji:'📋', color:'#16a34a', pos:[4,1],  eff:'+1 Eğt +1 Sh' },
  { id:26, name:'SAĞLIK',        type:'opportunity', emoji:'💊', color:'#15803d', pos:[3,1],  eff:'+1 Sağlık' }
];

const DICE_FACES = ['⚀','⚁','⚂','⚃','⚄','⚅'];

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
      <span class="char-emoji">${ch.emoji}</span>
      <div class="char-name">${ch.name}</div>
      <div class="char-desc">${ch.stats ? '' : ''}</div>
      <div class="char-stats">
        ${Object.entries(ch.stats).map(([stat,val]) => `
          <span class="stat-badge ${val >= 4 ? 'high' : val <= 1 ? 'low' : ''}">
            ${STAT_META[stat].icon} ${val}
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
      <span class="square-emoji">${sq.emoji}</span>
      <span class="square-name">${sq.name}</span>
      ${sq.eff ? `<span class="square-effect">${sq.eff}</span>` : ''}
      <div class="tokens-wrap" id="tokens-sq-${sq.id}"></div>
    `;
    board.appendChild(el);
  });

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
              <span class="ps-stat-label">${m.icon} ${key === 'sosyalHak' ? 'Sos.Hak' : key.charAt(0).toUpperCase() + key.slice(1)}</span>
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
        <span class="my-stat-icon">${m.icon}</span>
        <div class="my-stat-info">
          <div class="my-stat-name">${key === 'sosyalHak' ? 'Sosyal Hak' : key.charAt(0).toUpperCase() + key.slice(1)}</div>
          <div class="my-stat-bar"><div class="my-stat-fill ${m.cls}" style="width:${pct}%"></div></div>
        </div>
        <span class="my-stat-val">${val}</span>
      </div>
    `;
  }).join('');
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

  document.getElementById('modal-emoji').textContent = sq.emoji;
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
      return `<span class="effect-chip ${cls}">${m?.icon || ''} ${m ? m.label.split(' ')[1] : e.stat} ${sign}${e.change} (${e.from}→${e.to})</span>`;
    }).join('');
  }

  // Colour modal border by type
  const modal = document.getElementById('effect-card');
  modal.style.borderColor = sq.color || 'var(--border)';

  document.getElementById('effect-modal').classList.remove('hidden');
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

  document.getElementById('sys-emoji').textContent = card.emoji;
  document.getElementById('sys-name').textContent = card.name;
  document.getElementById('sys-desc').textContent = card.description;

  const grid = document.getElementById('sys-effects-grid');
  grid.innerHTML = STATE.players.map(p => {
    const pEffects = effects[p.id] || [];
    const ch = CHARACTERS[p.character];
    const hasEff = pEffects.length > 0;
    return `
      <div class="sys-effect-row ${hasEff ? 'has-effect' : ''}">
        <div class="player-name">${ch?.emoji || ''} ${p.name}</div>
        <div class="effect-line">
          ${hasEff
            ? pEffects.map(e => {
                const m = STAT_META[e.stat];
                const sign = e.change > 0 ? '+' : '';
                return `${m?.icon || ''} ${sign}${e.change} (${e.from}→${e.to})`;
              }).join(' ')
            : 'Etkilenmedi'}
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('system-modal').classList.remove('hidden');

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
                  <span>${m.icon}</span>
                  <span class="sval">${finalVal}</span>
                  <span class="sdiff ${diff >= 0 ? 'pos' : 'neg'}">${diff >= 0 ? '+' : ''}${diff}</span>
                </div>
              `;
            }).join('')}
          </div>
          <div class="score-obstacle">⛔ ${s.obstacleCount} engel kartı</div>
        </div>
      </div>
    `;
  }).join('');
}

document.getElementById('btn-play-again').addEventListener('click', () => {
  location.reload();
});

// ============================================================
// INIT
// ============================================================
connectWS();
