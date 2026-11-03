"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import useSound from "use-sound";

const STORAGE_KEY = "rimanashun_sound_muted";

interface SoundContextValue {
  muted: boolean;
  toggleMuted: () => void;
  playCorrect: () => void;
  playWrong: () => void;
}

const SoundContext = createContext<SoundContextValue | undefined>(undefined);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState(false);

  const [playSuccess, { stop: stopSuccess }] = useSound("/sounds/success_sound.mp3", {
    soundEnabled: !muted,
  });
  const [playError, { stop: stopError }] = useSound("/sounds/error_sound.mp3", {
    soundEnabled: !muted,
  });

  useEffect(() => {
    try {
      setMuted(localStorage.getItem(STORAGE_KEY) === "true");
    } catch {
      // localStorage unavailable (private mode, etc.) — default stands
    }
  }, []);

  const stopAll = () => {
    stopSuccess();
    stopError();
  };

  // A new answer cuts off the previous sound so quick answers don't overlap.
  const playCorrect = () => {
    stopAll();
    playSuccess();
  };

  const playWrong = () => {
    stopAll();
    playError();
  };

  const toggleMuted = () => {
    const next = !muted;
    if (next) stopAll();
    setMuted(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // ignore
    }
  };

  return (
    <SoundContext.Provider value={{ muted, toggleMuted, playCorrect, playWrong }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSoundEffects(): SoundContextValue {
  const ctx = useContext(SoundContext);
  if (!ctx) {
    throw new Error("useSoundEffects must be used within a SoundProvider");
  }
  return ctx;
}
