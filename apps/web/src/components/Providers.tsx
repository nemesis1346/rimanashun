"use client";

import { ReactNode } from "react";
import { LanguageProvider } from "@/lib/language";
import { SoundProvider } from "@/lib/sound";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <SoundProvider>{children}</SoundProvider>
    </LanguageProvider>
  );
}
