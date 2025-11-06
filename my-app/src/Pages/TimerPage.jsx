import { useState, useEffect, useRef } from 'react';
import '../Styles/Pages.css';

export default function TimerPage() {
  const defaultTimerMinutes = parseInt(localStorage.getItem('najahDefaultTimer')) || 25;
  
  const [minutes, setMinutes] = useState(defaultTimerMinutes);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputMinutes, setInputMinutes] = useState(String(defaultTimerMinutes).padStart(2, '0'));
  const [inputSeconds, setInputSeconds] = useState('00');
  
  // Music player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  // Add your music files to the public folder and list them here
  // The name will be formatted automatically, or you can customize it
  const [playlist] = useState([
    { id: 1, name: 'Honey Jam', url: '/Lofi.mp3' },
    { id: 2, name: 'Peach Prosecco', url: '/Lofi1.mp3' },
    { id: 3, name: 'Aromatic', url: '/Lofi2.mp3' },
    { id: 4, name: 'Noon', url: '/Lofi3.mp3' },
    // Add more tracks here as you add them to the public folder:
    // { id: 2, name: 'Your Track Name', url: '/yourfile.mp3' },
    // { id: 3, name: 'Another Track', url: '/anotherfile.mp3' }
  ]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [songName, setSongName] = useState(playlist[0]?.name || 'No song loaded');
  // when true, loop the current track; when false, advance through the playlist
  const [loopTrack, setLoopTrack] = useState(true);
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const gainRef = useRef(null);

  // Load default timer on component mount and when localStorage changes
  useEffect(() => {
    const savedTimer = parseInt(localStorage.getItem('najahDefaultTimer')) || 25;
    if (!isRunning && minutes === defaultTimerMinutes && seconds === 0) {
      setMinutes(savedTimer);
      setInputMinutes(String(savedTimer).padStart(2, '0'));
    }
  }, []);

  // Load first track on component mount
  useEffect(() => {
    if (playlist.length > 0 && audioRef.current) {
      audioRef.current.src = playlist[0].url;
      setSongName(playlist[0].name);
    }
  }, []);

  useEffect(() => {
    let interval;
    if (isRunning && (minutes > 0 || seconds > 0)) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsRunning(false);
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, minutes, seconds]);

  const handlePausePlay = () => {
    setIsRunning(prev => !prev);
    // toggle music play state to match timer
    setIsPlaying(prev => !prev);
  };

  const handleRefresh = () => {
    const savedTimer = parseInt(localStorage.getItem('najahDefaultTimer')) || 25;
    setIsRunning(false);
    setMinutes(savedTimer);
    setSeconds(0);
    setInputMinutes(String(savedTimer).padStart(2, '0'));
    setInputSeconds('00');
  };

  const handleTimerClick = () => {
    if (!isRunning) {
      setIsEditing(true);
      setInputMinutes(String(minutes).padStart(2, '0'));
      setInputSeconds(String(seconds).padStart(2, '0'));
    }
  };

  const handleMinutesChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 99)) {
      setInputMinutes(value);
    }
  };

  const handleSecondsChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 59)) {
      setInputSeconds(value);
    }
  };

  const handleBlur = () => {
    const mins = inputMinutes === '' ? 0 : parseInt(inputMinutes);
    const secs = inputSeconds === '' ? 0 : parseInt(inputSeconds);
    setMinutes(mins);
    setSeconds(secs);
    setInputMinutes(String(mins).padStart(2, '0'));
    setInputSeconds(String(secs).padStart(2, '0'));
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  // Music player functions
  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => {
          console.error('Error playing audio:', err);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleCanPlayThrough = () => {
    // Audio is fully buffered and can play through
    console.log('Audio can play through');
  };

  const handleWaiting = () => {
    // Audio is buffering
    console.log('Audio is buffering...');
  };

  const handleStalled = () => {
    // Attempt to recover from stalled state
    if (audioRef.current && isPlaying) {
      // Avoid calling load() which can cause audible gaps. Try a gentle resume.
      try {
        const currentPos = Math.max(0, audioRef.current.currentTime - 0.05);
        audioRef.current.currentTime = currentPos;
        audioRef.current.play().catch(err => console.error('Error recovering from stall:', err));
      } catch (err) {
        console.error('Stall recovery failed', err);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressClick = (e) => {
    if (audioRef.current) {
      const progressBar = e.currentTarget;
      const clickX = e.nativeEvent.offsetX;
      const width = progressBar.offsetWidth;
      const newTime = (clickX / width) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  // Playlist functions
  // safely change src with a short fade to avoid audible cuts
  const safeSetSrc = (index, play = false) => {
    if (!audioRef.current) return;
    const track = playlist[index];
    if (!track) return;
    const el = audioRef.current;
    const gain = gainRef.current;
    const ctx = audioCtxRef.current;
    setSongName(track.name);
    setCurrentTrackIndex(index);
    setCurrentTime(0);
    // If WebAudio available, fade out, switch src, fade in
    if (ctx && gain) {
      try {
        const now = ctx.currentTime;
        gain.cancelScheduledValues(now);
        gain.setValueAtTime(gain.value, now);
        gain.linearRampToValueAtTime(0.0001, now + 0.06);
        // after fade out, set src and optionally play
        setTimeout(() => {
          try {
            el.src = track.url;
            el.currentTime = 0;
            if (play) {
              // resume audio context if suspended (autoplay policies)
              if (ctx.state === 'suspended') ctx.resume().catch(()=>{});
              el.play().catch(err => console.error('Error playing after switch:', err));
              setIsPlaying(true);
            }
            const now2 = ctx.currentTime;
            gain.setValueAtTime(0.0001, now2);
            gain.linearRampToValueAtTime(1.0, now2 + 0.12);
          } catch (err) {
            console.error('Error switching track with fade', err);
          }
        }, 80);
      } catch (err) {
        console.error('Fade error', err);
        // fallback: immediate switch
        el.src = track.url;
        if (play) { el.play().catch(()=>{}); setIsPlaying(true); }
      }
    } else {
      // no WebAudio: just switch src and play
      el.src = track.url;
      el.currentTime = 0;
      if (play) {
        el.play().catch(err => console.error('Error playing track:', err));
        setIsPlaying(true);
      }
    }
  };

  const loadTrack = (index, play = false) => {
    if (index >= 0 && index < playlist.length) {
      safeSetSrc(index, play);
    }
  };

  const playNext = () => {
    if (playlist.length > 0) {
      const nextIndex = (currentTrackIndex + 1) % playlist.length;
      loadTrack(nextIndex, true);
    }
  };

  const playPrevious = () => {
    if (playlist.length > 0) {
      const prevIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;
      loadTrack(prevIndex, isPlaying);
    }
  };

  const handleTrackEnd = () => {
    // When a track ends
    if (playlist.length > 0) {
      const isLastTrack = currentTrackIndex === playlist.length - 1;
      // audio.loop flag handles repeating current track when loopTrack is true
      if (!loopTrack) {
        if (!isLastTrack) playNext();
        else setIsPlaying(false);
      }
    } else {
      setIsPlaying(false);
    }
  };
  
  // sync audio.loop with loopTrack
  useEffect(() => {
    if (audioRef.current) audioRef.current.loop = !!loopTrack;
  }, [loopTrack]);
  
  // sync play/pause state to audio element
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      const ctx = audioCtxRef.current;
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(()=>{}).then(() => {
          audioRef.current.play().catch(err => console.error('Error playing audio:', err));
        });
      } else {
        audioRef.current.play().catch(err => console.error('Error playing audio:', err));
      }
    } else {
      try { audioRef.current.pause(); } catch {}
    }
  }, [isPlaying, currentTrackIndex]);

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="timer-page">
      <div className="timer-hero">
        <div className="timer-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <h1 className="timer-title">Focus Timer</h1>
        <p className="timer-subtitle">Stay focused with calming lofi beats</p>
      </div>

      <div className="timer-display-container">
        <div 
          className={`timer-display ${!isRunning ? 'timer-clickable' : ''}`} 
          onClick={handleTimerClick}
          title={!isRunning ? 'Click to set time' : ''}
        >
          {isEditing ? (
            <div className="timer-edit">
              <input
                type="text"
                className="timer-input"
                value={inputMinutes}
                onChange={handleMinutesChange}
                onBlur={handleBlur}
                onKeyPress={handleKeyPress}
                maxLength={2}
                autoFocus
              />
              <span>:</span>
              <input
                type="text"
                className="timer-input"
                value={inputSeconds}
                onChange={handleSecondsChange}
                onBlur={handleBlur}
                onKeyPress={handleKeyPress}
                maxLength={2}
              />
            </div>
          ) : (
            <>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </>
          )}
        </div>
        
        <div className="timer-controls">
          <button 
            className="control-button pause-play-button" 
            onClick={handlePausePlay}
            title={isRunning ? 'Pause timer' : 'Start timer'}
          >
            {isRunning ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
          <button 
            className="control-button refresh-button" 
            onClick={handleRefresh}
            title="Reset timer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
          </button>
        </div>

        <div className="music-info">
          <audio 
            ref={audioRef}
            src={playlist[currentTrackIndex]?.url}
            preload="auto"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onCanPlayThrough={handleCanPlayThrough}
            onWaiting={handleWaiting}
            onStalled={handleStalled}
            onEnded={handleTrackEnd}
          >
            Your browser does not support the audio element.
          </audio>
          
          <p className="music-label">Now Playing</p>
          <p className="song-title" title={songName}>{songName}</p>
          <p className="playlist-info">
            {playlist.length > 0 
              ? `Track ${currentTrackIndex + 1} of ${playlist.length}` 
              : 'No playlist'}
          </p>
          
          <div className="music-controls">
            <button 
              className="music-nav-button" 
              onClick={playPrevious}
              disabled={playlist.length === 0}
              title="Previous track"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>
            
            <button 
              className="music-play-button" 
              onClick={toggleMusic}
              disabled={playlist.length === 0}
              title={isPlaying ? 'Pause music' : 'Play music'}
            >
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>
            
            <button 
              className="music-nav-button" 
              onClick={playNext}
              disabled={playlist.length === 0}
              title="Next track"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M6 18l8.5-6L6 6v12zm10-12v12h2V6h-2z"/>
              </svg>
            </button>
            
            <button 
              className={`music-loop-button ${loopTrack ? 'active' : ''}`}
              onClick={() => setLoopTrack(!loopTrack)}
              title={loopTrack ? 'Loop track: On' : 'Loop track: Off'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
              </svg>
            </button>
          </div>
          
          <div 
            className="progress-bar-container" 
            onClick={handleProgressClick}
            style={{ cursor: 'pointer' }}
            title="Click to seek"
          >
            <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <div className="progress-time">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          
          {playlist.length > 0 && (
            <div className="playlist-container">
              <h3 className="playlist-header">Playlist</h3>
              <div className="playlist-tracks">
                {playlist.map((track, index) => (
                  <div 
                    key={track.id} 
                    className={`playlist-track ${index === currentTrackIndex ? 'active' : ''}`}
                    onClick={() => {
                      loadTrack(index);
                      if (isPlaying) {
                        setTimeout(() => {
                          audioRef.current?.play();
                        }, 100);
                      }
                    }}
                  >
                    <div className="playlist-track-info">
                      <span className="playlist-track-number">{index + 1}.</span>
                      <span className="playlist-track-name">{track.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
