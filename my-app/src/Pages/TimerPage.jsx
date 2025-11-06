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
  const [loopPlaylist, setLoopPlaylist] = useState(true);
  const audioRef = useRef(null);

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
    setIsRunning(!isRunning);
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
      const currentPos = audioRef.current.currentTime;
      audioRef.current.load();
      audioRef.current.currentTime = currentPos;
      audioRef.current.play().catch(err => {
        console.error('Error recovering from stall:', err);
      });
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
  const loadTrack = (index) => {
    if (playlist[index] && audioRef.current) {
      audioRef.current.src = playlist[index].url;
      setSongName(playlist[index].name);
      setCurrentTrackIndex(index);
      setCurrentTime(0);
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error('Error playing audio:', err);
        });
      }
    }
  };

  const playNext = () => {
    if (playlist.length > 0) {
      const nextIndex = (currentTrackIndex + 1) % playlist.length;
      loadTrack(nextIndex);
      setIsPlaying(true);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(err => {
            console.error('Error playing next track:', err);
          });
        }
      }, 100);
    }
  };

  const playPrevious = () => {
    if (playlist.length > 0) {
      const prevIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;
      loadTrack(prevIndex);
      if (isPlaying) {
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play().catch(err => {
              console.error('Error playing previous track:', err);
            });
          }
        }, 100);
      }
    }
  };

  const handleTrackEnd = () => {
    // When a track ends
    if (playlist.length > 0) {
      const isLastTrack = currentTrackIndex === playlist.length - 1;
      
      if (loopPlaylist || !isLastTrack) {
        // Play next track if loop is on OR if it's not the last track
        playNext();
      } else {
        // Stop playing if loop is off and we're at the last track
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(false);
    }
  };

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
              className={`music-loop-button ${loopPlaylist ? 'active' : ''}`}
              onClick={() => setLoopPlaylist(!loopPlaylist)}
              title={loopPlaylist ? 'Loop: On' : 'Loop: Off'}
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
