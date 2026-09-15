/**
 * Khushi's Birthday Website - 3D Physical Book Interactive Engine
 * True Center-Spine Book Opening, Realistic Sound Synthesizer & Canvas Confetti
 * Mobile-First, Touch-Optimized
 */

(function () {
  'use strict';

  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const state = {
    isBookOpen: false,
    letterRevealed: false,
    soundEnabled: true,
    musicPlaying: false,
    candles: [
      { id: 1, blown: false },
      { id: 2, blown: false },
      { id: 3, blown: false }
    ],
    isBlowing: false,
    blowProgress: 0,
    blowTimer: null,
    micActive: false,
    micStream: null,
    audioContext: null
  };

  // DOM Elements
  const bookContainer = document.getElementById('bookContainer');
  const bookCoverFlap = document.getElementById('bookCoverFlap');
  const openCardBtn = document.getElementById('openCardBtn');
  const closeCardBtn = document.getElementById('closeCardBtn');
  const statusText = document.getElementById('statusText');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const bgMusicToggleBtn = document.getElementById('bgMusicToggleBtn');

  // Left Page Elements (Envelope & Letter)
  const envelopeView = document.getElementById('envelopeView');
  const letterView = document.getElementById('letterView');
  const sealBtn = document.getElementById('sealBtn');
  const toggleLetterBtn = document.getElementById('toggleLetterBtn');
  const toggleLetterLabel = document.getElementById('toggleLetterLabel');

  // Letter Zoom Modal Elements (Mobile Reading)
  const letterZoomModal = document.getElementById('letterZoomModal');
  const letterModalBackdrop = document.getElementById('letterModalBackdrop');
  const letterCloseXBtn = document.getElementById('letterCloseXBtn');
  const letterModalBackBtn = document.getElementById('letterModalBackBtn');

  // Right Page Elements (Cake & Candles)
  const blowHoldBtn = document.getElementById('blowHoldBtn');
  const blowProgressBar = document.getElementById('blowProgressBar');
  const blowBtnLabel = document.getElementById('blowBtnLabel');
  const windOverlay = document.getElementById('windOverlay');
  const relightBtn = document.getElementById('relightBtn');
  const micToggleBtn = document.getElementById('micToggleBtn');
  const micStatus = document.getElementById('micStatus');
  const candleHotspots = document.querySelectorAll('.candle-hotspot');

  // Celebration Modal
  const celebrationModal = document.getElementById('celebrationModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalRelightBtn = document.getElementById('modalRelightBtn');

  // ==========================================
  // PURE WEB AUDIO SYNTHESIZER
  // ==========================================
  function getAudioCtx() {
    if (!state.audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) state.audioContext = new AudioCtx();
    }
    if (state.audioContext && state.audioContext.state === 'suspended') {
      state.audioContext.resume();
    }
    return state.audioContext;
  }

  function playBookOpenSound() {
    if (!state.soundEnabled) return;
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const bufferSize = ctx.sampleRate * 0.35;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.1));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.15);
      filter.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.35);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
      noise.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  }

  function playPopSound() {
    if (!state.soundEnabled) return;
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(850, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {}
  }

  function playBlowSound() {
    if (!state.soundEnabled) return;
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const bufferSize = ctx.sampleRate * 0.3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.15);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
      noise.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  }

  function playFanfare() {
    if (!state.soundEnabled) return;
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const fanfare = [
        { f: 523.25, t: 0.00, d: 0.18 },
        { f: 659.25, t: 0.12, d: 0.18 },
        { f: 783.99, t: 0.24, d: 0.18 },
        { f: 1046.50, t: 0.36, d: 0.5 },
        { f: 1318.51, t: 0.42, d: 0.7 },
      ];
      fanfare.forEach(item => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(item.f, ctx.currentTime + item.t);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + item.t);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + item.t + item.d);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + item.t);
        osc.stop(ctx.currentTime + item.t + item.d);
      });
    } catch (e) {}
  }

  // Melodic Happy Birthday Theme Generator
  const hbNotes = [
    { note: 261.63, dur: 0.3 }, { note: 261.63, dur: 0.3 }, { note: 293.66, dur: 0.5 },
    { note: 261.63, dur: 0.5 }, { note: 349.23, dur: 0.5 }, { note: 329.63, dur: 0.9 },
    { note: 0, dur: 0.3 },
    { note: 261.63, dur: 0.3 }, { note: 261.63, dur: 0.3 }, { note: 293.66, dur: 0.5 },
    { note: 261.63, dur: 0.5 }, { note: 392.00, dur: 0.5 }, { note: 349.23, dur: 0.9 },
    { note: 0, dur: 0.3 },
    { note: 261.63, dur: 0.3 }, { note: 261.63, dur: 0.3 }, { note: 523.25, dur: 0.5 },
    { note: 440.00, dur: 0.5 }, { note: 349.23, dur: 0.5 }, { note: 329.63, dur: 0.5 },
    { note: 293.66, dur: 0.8 },
    { note: 0, dur: 0.3 },
    { note: 466.16, dur: 0.3 }, { note: 466.16, dur: 0.3 }, { note: 440.00, dur: 0.5 },
    { note: 349.23, dur: 0.5 }, { note: 392.00, dur: 0.5 }, { note: 349.23, dur: 1.0 },
    { note: 0, dur: 1.2 }
  ];

  let melodyIndex = 0;
  let melodyTimeout = null;

  function playNextMelodyNote() {
    if (!state.musicPlaying) return;
    const item = hbNotes[melodyIndex];
    melodyIndex = (melodyIndex + 1) % hbNotes.length;

    if (item.note > 0 && state.soundEnabled) {
      try {
        const ctx = getAudioCtx();
        if (ctx) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(item.note * 1.5, ctx.currentTime);
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + item.dur * 0.9);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + item.dur);
        }
      } catch (e) {}
    }

    melodyTimeout = setTimeout(playNextMelodyNote, item.dur * 1000);
  }

  function toggleBgMusic() {
    state.musicPlaying = !state.musicPlaying;
    if (state.musicPlaying) {
      bgMusicToggleBtn.classList.add('active');
      bgMusicToggleBtn.querySelector('.label').textContent = 'Melody ON';
      getAudioCtx();
      melodyIndex = 0;
      playNextMelodyNote();
    } else {
      bgMusicToggleBtn.classList.remove('active');
      bgMusicToggleBtn.querySelector('.label').textContent = 'Music';
      if (melodyTimeout) clearTimeout(melodyTimeout);
    }
  }

  // ==========================================
  // 3D PHYSICAL BOOK OPEN & CLOSE
  // ==========================================
  function openBook() {
    if (state.isBookOpen) return;
    state.isBookOpen = true;

    bookContainer.classList.remove('closed');
    bookContainer.classList.add('opened');

    statusText.textContent = "Book Open • Letter & Cake";
    openCardBtn.classList.add('hidden');
    closeCardBtn.classList.remove('hidden');

    playBookOpenSound();
  }

  function closeBook() {
    if (!state.isBookOpen) return;
    state.isBookOpen = false;

    bookContainer.classList.remove('opened');
    bookContainer.classList.add('closed');

    statusText.textContent = "Closed Card • Tap to Open";
    closeCardBtn.classList.add('hidden');
    openCardBtn.classList.remove('hidden');

    playBookOpenSound();
  }

  // Book Triggers
  if (bookCoverFlap) {
    bookCoverFlap.addEventListener('click', () => {
      if (!state.isBookOpen) openBook();
    });
  }
  if (openCardBtn) openCardBtn.addEventListener('click', openBook);
  if (closeCardBtn) closeCardBtn.addEventListener('click', closeBook);

  // ==========================================
  // LEFT PAGE: ENVELOPE / LETTER REVEAL & ZOOM
  // ==========================================
  function toggleLetterReveal() {
    state.letterRevealed = !state.letterRevealed;
    if (state.letterRevealed) {
      envelopeView.classList.add('hidden');
      letterView.classList.remove('hidden');
      toggleLetterLabel.textContent = "🔍 Zoom Letter";
    } else {
      letterView.classList.add('hidden');
      envelopeView.classList.remove('hidden');
      toggleLetterLabel.textContent = "✉️ Read Letter";
    }
    playPopSound();
  }

  function openLetterZoom() {
    if (letterZoomModal) {
      letterZoomModal.classList.add('active');
      playPopSound();
    }
  }

  function closeLetterZoom() {
    if (letterZoomModal) {
      letterZoomModal.classList.remove('active');
      playPopSound();
    }
  }

  if (sealBtn) sealBtn.addEventListener('click', toggleLetterReveal);
  if (toggleLetterBtn) {
    toggleLetterBtn.addEventListener('click', () => {
      if (!state.letterRevealed) {
        toggleLetterReveal();
      } else {
        openLetterZoom();
      }
    });
  }
  if (letterView) letterView.addEventListener('click', openLetterZoom);
  if (letterCloseXBtn) letterCloseXBtn.addEventListener('click', closeLetterZoom);
  if (letterModalBackBtn) letterModalBackBtn.addEventListener('click', closeLetterZoom);
  if (letterModalBackdrop) letterModalBackdrop.addEventListener('click', closeLetterZoom);

  // ==========================================
  // RIGHT PAGE: CANDLE BLOWING ENGINE
  // ==========================================
  const RING_CIRCUMFERENCE = 276.4;

  function setProgress(percent) {
    if (!blowProgressBar) return;
    const offset = RING_CIRCUMFERENCE - (percent / 100) * RING_CIRCUMFERENCE;
    blowProgressBar.style.strokeDashoffset = offset;
  }

  function startBlowing() {
    if (areAllCandlesBlown()) return;
    state.isBlowing = true;
    blowHoldBtn.classList.add('holding');
    windOverlay.classList.add('active');

    document.querySelectorAll('.flame:not(.extinguished)').forEach(f => {
      f.classList.add('bending');
    });

    playBlowSound();

    clearInterval(state.blowTimer);
    state.blowTimer = setInterval(() => {
      state.blowProgress += 4;
      setProgress(state.blowProgress);

      if (Math.random() < 0.2) playBlowSound();

      if (state.blowProgress >= 100) {
        stopBlowing();
        extinguishAllCandles();
      }
    }, 50);
  }

  function stopBlowing() {
    state.isBlowing = false;
    clearInterval(state.blowTimer);
    if (blowHoldBtn) blowHoldBtn.classList.remove('holding');
    if (windOverlay) windOverlay.classList.remove('active');

    document.querySelectorAll('.flame:not(.extinguished)').forEach(f => {
      f.classList.remove('bending');
    });

    if (!areAllCandlesBlown()) {
      state.blowProgress = 0;
      setProgress(0);
    }
  }

  function extinguishCandle(candleId) {
    const candle = state.candles.find(c => c.id === candleId);
    if (!candle || candle.blown) return;

    candle.blown = true;
    const flameEl = document.getElementById(`flame-${candleId}`);
    const smokeEl = document.getElementById(`smoke-${candleId}`);

    if (flameEl) flameEl.classList.add('extinguished');
    if (smokeEl) {
      smokeEl.classList.add('active');
      setTimeout(() => smokeEl.classList.remove('active'), 1800);
    }

    playPopSound();

    if (areAllCandlesBlown()) {
      onAllExtinguished();
    }
  }

  function extinguishAllCandles() {
    state.candles.forEach(c => extinguishCandle(c.id));
  }

  function areAllCandlesBlown() {
    return state.candles.every(c => c.blown);
  }

  function onAllExtinguished() {
    setProgress(100);
    if (blowBtnLabel) blowBtnLabel.textContent = "BLOWN! 🎉";

    playFanfare();
    launchConfetti(140);

    setTimeout(() => {
      celebrationModal.classList.add('active');
    }, 900);
  }

  function relightCandles() {
    state.candles.forEach(c => {
      c.blown = false;
      const flameEl = document.getElementById(`flame-${c.id}`);
      if (flameEl) flameEl.classList.remove('extinguished', 'bending');
    });
    state.blowProgress = 0;
    setProgress(0);
    if (blowBtnLabel) blowBtnLabel.textContent = "HOLD TO BLOW";
    celebrationModal.classList.remove('active');
    playPopSound();
  }

  // Candle Hotspot click
  candleHotspots.forEach(hotspot => {
    hotspot.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(hotspot.dataset.candle, 10);
      extinguishCandle(id);
    });
  });

  // Hold to Blow Touch & Mouse Listeners
  if (blowHoldBtn) {
    blowHoldBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      startBlowing();
    });
    window.addEventListener('mouseup', () => {
      if (state.isBlowing) stopBlowing();
    });

    blowHoldBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startBlowing();
    }, { passive: false });

    blowHoldBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      stopBlowing();
    }, { passive: false });

    blowHoldBtn.addEventListener('touchcancel', () => stopBlowing());
  }

  if (relightBtn) relightBtn.addEventListener('click', relightCandles);

  // Optional Mic Enhancement
  async function toggleMic() {
    if (state.micActive) {
      if (state.micStream) {
        state.micStream.getTracks().forEach(t => t.stop());
        state.micStream = null;
      }
      state.micActive = false;
      micToggleBtn.classList.remove('active');
      micStatus.textContent = "";
      return;
    }

    try {
      micStatus.textContent = "Requesting mic...";
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      state.micStream = stream;
      state.micActive = true;
      micToggleBtn.classList.add('active');
      micStatus.textContent = "Mic active: blow gently!";

      const ctx = getAudioCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyzer = ctx.createAnalyser();
      analyzer.fftSize = 256;
      source.connect(analyzer);

      const dataArray = new Uint8Array(analyzer.frequencyBinCount);
      let sustain = 0;

      function checkAudio() {
        if (!state.micActive) return;
        analyzer.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < 28; i++) sum += dataArray[i];
        const avg = sum / 28;

        if (avg > 48) {
          sustain++;
          windOverlay.classList.add('active');
          document.querySelectorAll('.flame:not(.extinguished)').forEach(f => f.classList.add('bending'));
          if (sustain > 7) {
            extinguishAllCandles();
            sustain = 0;
          }
        } else {
          sustain = Math.max(0, sustain - 1);
          if (sustain === 0 && !state.isBlowing) {
            windOverlay.classList.remove('active');
            document.querySelectorAll('.flame:not(.extinguished)').forEach(f => f.classList.remove('bending'));
          }
        }
        requestAnimationFrame(checkAudio);
      }
      checkAudio();
    } catch (e) {
      micStatus.textContent = "Mic unavailable. Use the Hold button!";
      state.micActive = false;
      setTimeout(() => micStatus.textContent = "", 3000);
    }
  }

  if (micToggleBtn) micToggleBtn.addEventListener('click', toggleMic);

  // ==========================================
  // CELEBRATION MODAL & AUDIO TOGGLES
  // ==========================================
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      celebrationModal.classList.remove('active');
    });
  }
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', () => {
      celebrationModal.classList.remove('active');
    });
  }
  if (modalRelightBtn) {
    modalRelightBtn.addEventListener('click', () => {
      relightCandles();
    });
  }

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      soundToggleBtn.classList.toggle('active', state.soundEnabled);
      const label = soundToggleBtn.querySelector('.label');
      const icon = soundToggleBtn.querySelector('.icon');
      if (state.soundEnabled) {
        label.textContent = "Sound";
        icon.textContent = "🔊";
        playPopSound();
      } else {
        label.textContent = "Muted";
        icon.textContent = "🔇";
      }
    });
  }

  if (bgMusicToggleBtn) bgMusicToggleBtn.addEventListener('click', toggleBgMusic);

  // ==========================================
  // CONFETTI & PARTICLES
  // ==========================================
  const confettiCanvas = document.getElementById('confettiCanvas');
  const ambientCanvas = document.getElementById('ambientCanvas');
  const confettiCtx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
  const ambientCtx = ambientCanvas ? ambientCanvas.getContext('2d') : null;

  let confettiParticles = [];
  let ambientParticles = [];

  function resizeCanvases() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    if (confettiCanvas) {
      confettiCanvas.width = width;
      confettiCanvas.height = height;
    }
    if (ambientCanvas) {
      ambientCanvas.width = width;
      ambientCanvas.height = height;
    }
  }

  window.addEventListener('resize', resizeCanvases);
  window.addEventListener('orientationchange', resizeCanvases);
  resizeCanvases();

  class AmbientParticle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight;
      this.size = Math.random() * 2.2 + 1;
      this.speedY = -(Math.random() * 0.35 + 0.12);
      this.speedX = (Math.random() - 0.5) * 0.25;
      this.opacity = Math.random() * 0.6 + 0.2;
      this.color = ['#ffffff', '#fcd34d', '#fda4af', '#f472b6'][Math.floor(Math.random() * 4)];
    }
    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      if (this.y < 0) this.reset();
    }
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  class ConfettiParticle {
    constructor(x, y) {
      this.x = x !== undefined ? x : Math.random() * window.innerWidth;
      this.y = y !== undefined ? y : -10;
      this.size = Math.random() * 7 + 4;
      this.speedY = Math.random() * 4 + 2;
      this.speedX = (Math.random() - 0.5) * 6;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 8;
      this.colors = ['#e11d48', '#fb7185', '#fcd34d', '#38bdf8', '#a855f7', '#ffffff', '#ec4899'];
      this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
      this.shape = Math.random() > 0.3 ? 'rect' : 'circle';
    }
    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.rotation += this.rotationSpeed;
      this.speedY += 0.07;
    }
    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.fillStyle = this.color;
      if (this.shape === 'rect') {
        ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  for (let i = 0; i < 28; i++) ambientParticles.push(new AmbientParticle());

  function launchConfetti(count = 130) {
    for (let i = 0; i < count; i++) {
      const startX = window.innerWidth * 0.5 + (Math.random() - 0.5) * 180;
      const startY = window.innerHeight * 0.4 + (Math.random() - 0.5) * 80;
      const p = new ConfettiParticle(startX, startY);
      p.speedY = -(Math.random() * 8 + 3.5);
      p.speedX = (Math.random() - 0.5) * 10;
      confettiParticles.push(p);
    }
  }

  function animate() {
    if (ambientCtx) {
      ambientCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ambientParticles.forEach(p => { p.update(); p.draw(ambientCtx); });
    }
    if (confettiCtx) {
      confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let i = confettiParticles.length - 1; i >= 0; i--) {
        const p = confettiParticles[i];
        p.update();
        p.draw(confettiCtx);
        if (p.y > window.innerHeight + 20) confettiParticles.splice(i, 1);
      }
    }
    requestAnimationFrame(animate);
  }

  animate();
  setProgress(0);

})();
