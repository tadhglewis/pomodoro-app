import { useState, useEffect } from 'react';

type SoundType = 'complete' | 'warning' | 'tick';
type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>(Notification.permission);

  useEffect(() => {
    if (permission === 'default') {
      Notification.requestPermission().then(setPermission);
    }
  }, [permission]);

  const playSound = (type: SoundType = 'complete'): void => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const frequencies: Record<SoundType, number[]> = {
      complete: [523.25, 659.25, 783.99], // C5, E5, G5 chord
      warning: [440, 554.37], // A4, C#5
      tick: [800] // High tick sound
    };

    const freq = frequencies[type] || frequencies.complete;
    
    freq.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5 + index * 0.1);
      
      oscillator.start(audioContext.currentTime + index * 0.1);
      oscillator.stop(audioContext.currentTime + 0.5 + index * 0.1);
    });
  };

  const showNotification = (title: string, body: string, options: NotificationOptions = {}): void => {
    if (permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/vite.svg',
        badge: '/vite.svg',
        ...options
      });
    }
  };

  const notifyTimerComplete = (mode: TimerMode): void => {
    const messages: Record<TimerMode, { title: string; body: string }> = {
      work: {
        title: '🎉 Great job!',
        body: 'Time for a well-deserved break!'
      },
      shortBreak: {
        title: '⚡ Break\'s over!',
        body: 'Ready to focus again?'
      },
      longBreak: {
        title: '🚀 Long break finished!',
        body: 'Time to get back to work!'
      }
    };

    const message = messages[mode] || messages.work;
    showNotification(message.title, message.body);
    playSound('complete');
  };

  const notifyLastMinute = (): void => {
    showNotification('⏰ One minute left!', 'Almost there, keep going!');
    playSound('warning');
  };

  return {
    permission,
    playSound,
    showNotification,
    notifyTimerComplete,
    notifyLastMinute
  };
};