import { useState, useEffect, useRef } from 'react';
import { useNotifications } from '../hooks/useNotifications';

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // 'work', 'shortBreak', 'longBreak'
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);
  const { notifyTimerComplete, notifyLastMinute, playSound } = useNotifications();

  const modes = {
    work: { time: 25 * 60, label: 'Focus Time', color: 'from-red-500 to-pink-500' },
    shortBreak: { time: 5 * 60, label: 'Short Break', color: 'from-green-500 to-emerald-500' },
    longBreak: { time: 15 * 60, label: 'Long Break', color: 'from-blue-500 to-cyan-500' }
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(timeLeft => {
          if (timeLeft === 61) {
            notifyLastMinute();
          }
          return timeLeft - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, timeLeft, notifyLastMinute]);

  const handleTimerComplete = () => {
    setIsActive(false);
    notifyTimerComplete(mode);
    
    if (mode === 'work') {
      setSessions(prev => prev + 1);
      const nextMode = (sessions + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
      setMode(nextMode);
      setTimeLeft(modes[nextMode].time);
    } else {
      setMode('work');
      setTimeLeft(modes.work.time);
    }
  };

  const toggleTimer = () => {
    if (!isActive) {
      playSound('tick');
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(modes[mode].time);
  };

  const switchMode = (newMode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(modes[newMode].time);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((modes[mode].time - timeLeft) / modes[mode].time) * 100;
  const circumference = 2 * Math.PI * 120;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      {/* Main Timer Container */}
      <div className="glass p-12 max-w-md w-full relative z-10">
        {/* Mode Selector */}
        <div className="flex justify-center mb-8 space-x-2">
          {Object.entries(modes).map(([key, modeData]) => (
            <button
              key={key}
              onClick={() => switchMode(key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                mode === key
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {modeData.label}
            </button>
          ))}
        </div>

        {/* Timer Circle */}
        <div className="relative flex items-center justify-center mb-8">
          <svg className="transform -rotate-90 w-64 h-64" viewBox="0 0 256 256">
            {/* Background Circle */}
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Progress Circle */}
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-in-out"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" className="text-white" stopColor="currentColor" stopOpacity="0.8" />
                <stop offset="100%" className="text-white" stopColor="currentColor" stopOpacity="0.4" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Timer Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold mb-2 font-mono tracking-tight">
              {formatTime(timeLeft)}
            </div>
            <div className="text-white/70 text-sm uppercase tracking-widest">
              {modes[mode].label}
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={toggleTimer}
            className={`glass-button text-lg px-8 py-4 font-semibold ${
              isActive ? 'bg-red-500/20 hover:bg-red-500/30' : 'bg-green-500/20 hover:bg-green-500/30'
            }`}
          >
            {isActive ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={resetTimer}
            className="glass-button text-lg px-6 py-4"
          >
            Reset
          </button>
        </div>

        {/* Session Counter */}
        <div className="text-center">
          <div className="text-white/70 text-sm mb-2">Sessions Completed</div>
          <div className="flex justify-center space-x-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < sessions % 4 ? 'bg-white' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
          <div className="text-white/70 text-sm mt-2">
            Total: {sessions}
          </div>
        </div>
      </div>

      {/* Floating Stats */}
      <div className="glass p-6 mt-8 max-w-md w-full relative z-10">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{sessions}</div>
            <div className="text-white/70 text-xs uppercase tracking-wide">Sessions</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{Math.floor(sessions / 4)}</div>
            <div className="text-white/70 text-xs uppercase tracking-wide">Cycles</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{Math.round(sessions * 25 / 60 * 10) / 10}h</div>
            <div className="text-white/70 text-xs uppercase tracking-wide">Focus Time</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;