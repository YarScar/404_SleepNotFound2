import { useState, useEffect, useRef } from 'react';
import '../Styles/Pages.css';
import audioService from '../Utils/audioService';

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
  const [playlist] = useState([
    { id: 1, name: 'Honey Jam', url: '/Lofi.mp3' },
    { id: 2, name: 'Peach Prosecco', url: '/Lofi1.mp3' },
    { id: 3, name: 'Aromatic', url: '/Lofi2.mp3' },
    { id: 4, name: 'Noon', url: '/Lofi3.mp3' },
  ]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  
  // const [songName, setSongName] = useState(playlist[0]?.name || 'No song loaded');
  const songName = playlist[currentTrackIndex]?.name || 'No song loaded';

  // Track loop state (loopTrack is a boolean)
  const [loopTrack, setLoopTrack] = useState(true);
  const [loopPlaylist, setLoopPlaylist] = useState(false);

  // Use refs to track loop state without causing re-renders
  const loopTrackRef = useRef(loopTrack);
  const loopPlaylistRef = useRef(loopPlaylist);
  
  // Update refs when state changes
  useEffect(() => {
    loopTrackRef.current = loopTrack;
  }, [loopTrack]);
  
  useEffect(() => {
    loopPlaylistRef.current = loopPlaylist;
  }, [loopPlaylist]);

  // Error state for audio playback issues
  const [audioError, setAudioError] = useState('');

  // Load default timer on component mount and when localStorage changes
  useEffect(() => {
    const savedTimer = parseInt(localStorage.getItem('najahDefaultTimer')) || 25;
    if (!isRunning && minutes === defaultTimerMinutes && seconds === 0) {
      setMinutes(savedTimer);
      setInputMinutes(String(savedTimer).padStart(2, '0'));
    }
  }, []);

  // Initialize audio service on component mount
  useEffect(() => {
    audioService.init(playlist, currentTrackIndex);
    audioService.setLoop(loopTrack);

    const onTime = () => {
      const a = audioService.getAudio();
      setCurrentTime(a ? a.currentTime : 0);
    };
    const onMeta = () => {
      const a = audioService.getAudio();
      setDuration(a ? a.duration : 0);
    };
    const onEnded = () => {
      if (!loopTrackRef.current) {
        if (loopPlaylistRef.current) {
          audioService.next();
        } else {
          const isLast = currentTrackIndex === playlist.length - 1;
          if (!isLast) audioService.next();
          else setIsPlaying(false);
        }
      }
    };
    const onTrackChange = (idx) => {
      // update current track index and sync playback info; songName is derived elsewhere
      setCurrentTrackIndex(idx);
      const a = audioService.getAudio();
      if (a) {
        setDuration(a.duration || 0);
        setCurrentTime(a.currentTime || 0);
      }
    };

    audioService.on('timeupdate', onTime);
    audioService.on('loadedmetadata', onMeta);
    audioService.on('ended', onEnded);
    audioService.on('trackchange', onTrackChange);

    return () => {
      audioService.off('timeupdate', onTime);
      audioService.off('loadedmetadata', onMeta);
      audioService.off('ended', onEnded);
      audioService.off('trackchange', onTrackChange);
    };
  }, [currentTrackIndex, playlist.length]); // Removed loopTrack and loopPlaylist from dependencies

  // Sync loopTrack state with audioService
  useEffect(() => audioService.setLoop(loopTrack), [loopTrack]);

  // Timer countdown logic
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
    if (!isPlaying) {
      audioService.play().catch(err => {
        console.error('Play failed', err);
        setAudioError(err && err.message ? err.message : 'Playback blocked by browser');
      });
      setIsPlaying(true);
    } else {
      audioService.pause();
      setIsPlaying(false);
    }
  };

  const handleRefresh = () => {
    const savedTimer = parseInt(localStorage.getItem('najahDefaultTimer')) || 25;
    setIsRunning(false);
    setMinutes(savedTimer);
    setSeconds(0);
    setInputMinutes(String(savedTimer).padStart(2, '0'));
    setInputSeconds('00');
    audioService.pause();
    setIsPlaying(false);
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
    // Allow empty string or any number, but validate on blur
    if (value === '' || value.length <= 2) {
      setInputSeconds(value);
    }
  };

  const handleBlur = (e) => {
    // Only close edit mode if clicking outside the timer-edit container
    const timerEdit = e.currentTarget.closest('.timer-edit');
    if (timerEdit && e.relatedTarget && timerEdit.contains(e.relatedTarget)) {
      // Focus is moving to another input within timer-edit, don't close
      return;
    }
    
    const mins = inputMinutes === '' ? 0 : parseInt(inputMinutes);
    let secs = inputSeconds === '' ? 0 : parseInt(inputSeconds);
    // Clamp seconds to 0-59
    if (secs > 59) secs = 59;
    if (secs < 0) secs = 0;
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

  const toggleMusic = () => {
    if (!isPlaying) {
      audioService.play().catch(err => {
        console.error('Play failed', err);
        setAudioError(err && err.message ? err.message : 'Playback blocked by browser');
      });
      setIsPlaying(true);
    } else {
      audioService.pause();
      setIsPlaying(false);
    }
  };

  const handleProgressClick = (e) => {
    const el = audioService.getAudio();
    if (el) {
      const progressBar = e.currentTarget;
      const clickX = e.nativeEvent.offsetX;
      const width = progressBar.offsetWidth;
      const newTime = (clickX / width) * duration;
      el.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const loadTrack = (index, play = false) => audioService.setTrack(index, play);
  const playNext = () => audioService.next();
  const playPrevious = () => audioService.prev();

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
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
            <div className="timer-edit" onClick={(e) => e.stopPropagation()}>
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
          {/* audio is managed globally by audioService; no local element rendered */}
           
           <p className="music-label">Now Playing</p>
           <p className="song-title" title={songName}>{songName}</p>
           <p className="playlist-info">
             {playlist.length > 0 
               ? `Track ${currentTrackIndex + 1} of ${playlist.length}` 
               : 'No playlist'}
           </p>
           
           <div className="music-controls">
             <button 
               className={`music-loop-button ${loopTrack ? 'active' : ''}`}
               onClick={() => {
                 if (!loopTrack) {
                   setLoopTrack(true);
                   setLoopPlaylist(false); // Turn off playlist loop
                 } else {
                   setLoopTrack(false);
                 }
               }}
               title={loopTrack ? 'Loop current track: On' : 'Loop current track: Off'}
             >
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                 <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
               </svg>
             </button>
             
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
               className={`music-loop-button ${loopPlaylist ? 'active' : ''}`}
               onClick={() => {
                 if (!loopPlaylist) {
                   setLoopPlaylist(true);
                   setLoopTrack(false); // Turn off single track loop
                 } else {
                   setLoopPlaylist(false);
                 }
               }}
               title={loopPlaylist ? 'Loop playlist: On' : 'Loop playlist: Off'}
               disabled={playlist.length === 0}
             >
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                 <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
                 <text x="12" y="15" fontSize="8" fill="currentColor" textAnchor="middle" fontWeight="bold">PL</text>
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
                      loadTrack(index, isPlaying);
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

     {/* Floating Bubbles */}
     <div className="bubble"></div>
     <div className="bubble"></div>
     <div className="bubble"></div>
     <div className="bubble"></div>
     <div className="bubble"></div>
     <div className="bubble"></div>
     <div className="bubble"></div>
     <div className="bubble"></div>
     <div className="bubble"></div>
     <div className="bubble"></div>
     <div className="bubble"></div>
     <div className="bubble"></div>
     <div className="bubble"></div>
     <div className="bubble"></div>
     <div className="bubble"></div>
     </>
   );
 }
