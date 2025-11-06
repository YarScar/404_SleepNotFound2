const audioService = (() => {
  let audioEls = null;
  let ctx = null;
  let sources = [];
  let gains = [];
  let active = 0; // index of currently audible element (0 or 1)
  let playlist = [];
  let currentIndex = 0;
  const listeners = {};
  const fadeMs = 120; // crossfade duration in ms
  let volume = 0.7; // Default volume at 70%

  function ensure() {
    if (audioEls) return audioEls;
    audioEls = [document.createElement('audio'), document.createElement('audio')];
    audioEls.forEach(el => {
      el.preload = 'auto';
      el.crossOrigin = 'anonymous';
      el.style.display = 'none';
      el.volume = volume; // Set initial volume
      document.body.appendChild(el);
    });

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        ctx = new AudioContext();
        audioEls.forEach((el, i) => {
          try {
            sources[i] = ctx.createMediaElementSource(el);
            gains[i] = ctx.createGain();
            gains[i].gain.value = i === active ? 1 : 0;
            sources[i].connect(gains[i]);
            gains[i].connect(ctx.destination);
          } catch (e) {
            console.warn('audioService: failed to create media source', e);
          }
        });
      }
    } catch (e) {
      console.warn('audioService: WebAudio not available', e);
      ctx = null;
    }

    // forward element events
    audioEls.forEach((el, i) => {
      ['timeupdate','loadedmetadata','canplaythrough','waiting','stalled','ended','error'].forEach(name => {
        el.addEventListener(name, (ev) => emit(name, ev));
      });
    });

    return audioEls;
  }

  function init(pl = [], start = 0) {
    playlist = Array.isArray(pl) ? pl : [];
    currentIndex = Math.max(0, Math.min(start, playlist.length - 1));
    ensure();
    if (playlist.length > 0) {
      audioEls[active].src = playlist[currentIndex].url;
      audioEls[active].volume = volume; // Ensure volume is set
      audioEls[active].load(); // Explicitly load the audio
    }
  }

  function getAudio() {
    ensure();
    return audioEls[active];
  }

  function play() {
    ensure();
    console.log('audioService: play() called, active element:', active, 'src:', audioEls[active].src);
    
    // try to resume audio context if suspended
    if (ctx && ctx.state === 'suspended') {
      console.log('audioService: Resuming suspended audio context');
      return ctx.resume().then(() => {
        console.log('audioService: Context resumed, playing...');
        return audioEls[active].play();
      }).catch((err) => {
        console.error('audioService resume/play error:', err);
      });
    }
    return audioEls[active].play().catch((err) => {
      console.error('audioService play error:', err, 'src:', audioEls[active].src);
    });
  }
  function pause() {
    ensure();
    audioEls[0].pause();
    audioEls[1].pause();
  }

  function setLoop(v) {
    ensure();
    audioEls.forEach(el => el.loop = !!v);
  }

  function setVolume(v) {
    volume = Math.max(0, Math.min(1, v));
    ensure();
    audioEls.forEach(el => el.volume = volume);
    // Also update the active gain node if using WebAudio
    if (ctx && gains[active]) {
      gains[active].gain.value = volume;
    }
  }

  function getVolume() {
    return volume;
  }

  function setTrack(index, play = false) {
    if (!playlist[index]) {
      console.error('audioService: No track at index', index);
      return;
    }
    ensure();
    console.log('audioService: Setting track', index, playlist[index].name || playlist[index].url);
    
    if (index === currentIndex) {
      if (play) {
        console.log('audioService: Playing current track');
        audioEls[active].play().catch((err) => {
          console.error('audioService play error (current track):', err);
        });
      }
      return;
    }

    const next = 1 - active;
    const nextEl = audioEls[next];
    try {
      console.log('audioService: Loading new track into element', next);
      nextEl.src = playlist[index].url;
      nextEl.currentTime = 0;
      nextEl.volume = volume; // Ensure volume is set for new track
      nextEl.load(); // Explicitly load the new track
      
      // Add error listener for this track
      nextEl.onerror = (e) => {
        console.error('audioService: Failed to load track', playlist[index].name || playlist[index].url, e);
      };
      nextEl.onloadeddata = () => {
        console.log('audioService: Track loaded successfully', playlist[index].name || playlist[index].url);
      };
    } catch (e) {
      console.error('audioService set src error', e);
    }

    // If we have WebAudio, perform crossfade
    if (ctx && gains[active] && gains[next]) {
      const now = ctx.currentTime;
      const fadeSec = Math.max(0, fadeMs / 1000);
      try {
        gains[next].gain.cancelScheduledValues(now);
        gains[active].gain.cancelScheduledValues(now);
        gains[next].gain.setValueAtTime(0.0001, now);
        // ensure next element plays so its buffer decodes
        console.log('audioService: Starting crossfade, playing next element');
        nextEl.play().catch((err) => {
          console.error('audioService: Failed to play during crossfade:', err);
        });
        gains[next].gain.linearRampToValueAtTime(volume, now + fadeSec); // Use volume variable
        gains[active].gain.setValueAtTime(gains[active].gain.value || volume, now);
        gains[active].gain.linearRampToValueAtTime(0.0001, now + fadeSec);
      } catch (err) {
        console.warn('audioService crossfade failed', err);
        // fallback to immediate switch
        try { 
          audioEls[active].pause(); 
          nextEl.play().catch((err) => {
            console.error('audioService: Fallback play failed:', err);
          }); 
        } catch (e) {
          console.error('audioService: Fallback error:', e);
        }
      }
      // swap active after fade duration
      setTimeout(() => {
        try { audioEls[active].pause(); } catch {}
        active = next;
        currentIndex = index;
        console.log('audioService: Crossfade complete, new active:', active, 'track:', currentIndex);
        // Ensure the new active element has correct gain
        if (gains[active]) {
          gains[active].gain.value = volume;
        }
        emit('trackchange', currentIndex);
        // Only pause if we shouldn't be playing
        if (!play && !audioEls[active].paused) {
          console.log('audioService: Pausing after track change (play=false)');
          audioEls[active].pause();
        }
      }, fadeMs + 10);
    } else {
      // no WebAudio: immediate swap
      console.log('audioService: Immediate swap (no WebAudio)');
      try { 
        audioEls[active].pause(); 
        if (play) {
          nextEl.play().catch((err) => {
            console.error('audioService: Immediate play failed:', err);
          }); 
        }
      } catch (e) {
        console.error('audioService: Immediate swap error:', e);
      }
      active = next;
      currentIndex = index;
      emit('trackchange', currentIndex);
    }
  }

  function next() {
    if (playlist.length === 0) return;
    setTrack((currentIndex + 1) % playlist.length, true);
  }
  function prev() {
    if (playlist.length === 0) return;
    setTrack((currentIndex - 1 + playlist.length) % playlist.length, true);
  }

  function on(evt, handler) {
    listeners[evt] = listeners[evt] || [];
    listeners[evt].push(handler);
  }
  function off(evt, handler) {
    if (!listeners[evt]) return;
    if (handler) listeners[evt] = listeners[evt].filter(h => h !== handler);
    else listeners[evt] = [];
  }
  function emit(evt, data) {
    (listeners[evt] || []).forEach(h => { try { h(data); } catch (e) { console.error('audioService listener error', e); } });
  }

  function getCurrentIndex() { return currentIndex; }

  return { init, play, pause, setTrack, next, prev, setLoop, setVolume, getVolume, on, off, getAudio, getCurrentIndex };
})();

export default audioService;
