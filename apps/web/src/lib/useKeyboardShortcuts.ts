import { useEffect } from "react";

export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Holding a key shouldn't skip questions, and Cmd+1 should still switch tabs
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      // Leave the header's language dropdown alone
      if ((e.target as HTMLElement).closest("input, textarea, select")) return;

      const action = shortcuts[e.key];
      if (!action) return;
      e.preventDefault(); // Stops double-firing on a focused button, and Space scrolling
      action();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });
}
