import { useEffect, useRef, useState } from "react";

export const useGameSounds = () => {
  const [isMusicEnabled, setIsMusicEnabled] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const soundsRef = useRef<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    // Initialize background music
    backgroundMusicRef.current = new Audio("https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3");
    backgroundMusicRef.current.loop = true;
    backgroundMusicRef.current.volume = 0.3;

    // Initialize sound effects using free sound libraries
    soundsRef.current = {
      diceRoll: new Audio("https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3"),
      earnMoney: new Audio("https://assets.mixkit.co/active_storage/sfx/1997/1997-preview.mp3"),
      loseMoney: new Audio("https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3"),
      opportunity: new Audio("https://assets.mixkit.co/active_storage/sfx/1999/1999-preview.mp3"),
      payDay: new Audio("https://assets.mixkit.co/active_storage/sfx/1985/1985-preview.mp3"),
      baby: new Audio("https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3"),
      charity: new Audio("https://assets.mixkit.co/active_storage/sfx/1998/1998-preview.mp3"),
      market: new Audio("https://assets.mixkit.co/active_storage/sfx/2001/2001-preview.mp3"),
      downsized: new Audio("https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3"),
      win: new Audio("https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3"),
    };

    // Set volume for all sound effects
    Object.values(soundsRef.current).forEach(sound => {
      sound.volume = 0.5;
    });

    return () => {
      // Cleanup
      backgroundMusicRef.current?.pause();
      Object.values(soundsRef.current).forEach(sound => sound.pause());
    };
  }, []);

  useEffect(() => {
    if (backgroundMusicRef.current) {
      if (isMusicEnabled) {
        backgroundMusicRef.current.play().catch(err => console.log("Audio play failed:", err));
      } else {
        backgroundMusicRef.current.pause();
      }
    }
  }, [isMusicEnabled]);

  const playSound = (soundName: string) => {
    if (!isSoundEnabled) return;
    
    const sound = soundsRef.current[soundName];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(err => console.log("Sound play failed:", err));
    }
  };

  const toggleMusic = () => setIsMusicEnabled(prev => !prev);
  const toggleSound = () => setIsSoundEnabled(prev => !prev);

  return {
    playSound,
    isMusicEnabled,
    isSoundEnabled,
    toggleMusic,
    toggleSound,
  };
};
