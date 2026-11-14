"use client";

import { ReactNode } from "react";
import { LanguageProvider } from "@/lib/language";
import { SoundProvider } from "@/lib/sound";
import ProgressSync from "@/components/ProgressSync";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <SoundProvider>
        <ProgressSync />
        {children}
      </SoundProvider>
    </LanguageProvider>
  );
}
