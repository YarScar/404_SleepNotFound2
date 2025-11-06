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
  const audioRef = useRef(null);

  // Load default timer on component mount and when localStorage changes
  useEffect(() => {
    const savedTimer = parseInt(localStorage.getItem('najahDefaultTimer')) || 25;
    if (!isRunning && minutes === defaultTimerMinutes && seconds === 0) {
      setMinutes(savedTimer);
      setInputMinutes(String(savedTimer).padStart(2, '0'));
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
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
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
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            loop
          >
            <source src="/path-to-your-lofi-music.mp3" type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
          
          <p className="music-label">Now Playing</p>
          <p className="song-title">Lofi Hip Hop - Chill Beats to Study/Relax</p>
          
          <div className="music-controls">
            <button 
              className="music-play-button" 
              onClick={toggleMusic}
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
        </div>
      </div>
    </div>
  );
}
