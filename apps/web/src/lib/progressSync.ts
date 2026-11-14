// Keeps localStorage progress (progress.ts) in step with the logged-in
// user's account on the backend (/v1/progress).
//
// Progress only counts toward an account while logged in. Logged out, the
// app still works and records progress, but only in this browser, and it is
// thrown away on login. OWNER_KEY records whose progress localStorage holds
// (an account id, or nothing for logged-out progress); whenever that doesn't
// match who's logged in now, local progress is cleared:
// - logging in   -> logged-out (or another account's) progress is discarded,
//                   then the account's progress is loaded
// - logging out  -> the account's progress is removed from this browser
//                   (it's on the server), so the next visitor starts empty
import axios from "axios";
import { API_BASE } from "@/lib/data";
import {
  clearProgress,
  getAllProgress,
  mergeProgress,
  Progress,
  ProgressKey,
  setRemoteProgress,
} from "@/lib/progress";

export const OWNER_KEY = "progressOwner";

export interface ProgressApi {
  // POST /v1/progress: adds items, resolves with the account's full progress
  add(progress: Partial<Progress>): Promise<Progress>;
}

export function createProgressApi(getToken: () => Promise<string>): ProgressApi {
  return {
    async add(progress) {
      const token = await getToken();
      const res = await axios.post<Progress>(`${API_BASE}/v1/progress`, progress, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
  };
}

function getOwner(): string | null {
  try {
    return localStorage.getItem(OWNER_KEY);
  } catch {
    return null;
  }
}

function setOwner(sub: string | null) {
  try {
    if (sub) localStorage.setItem(OWNER_KEY, sub);
    else localStorage.removeItem(OWNER_KEY);
  } catch {
    // ignore
  }
}

// Makes localStorage hold only `sub`'s progress (null = logged out); see the
// rules at the top of this file.
export function claimLocalProgress(sub: string | null) {
  if (getOwner() !== sub) clearProgress();
  setOwner(sub);
}

// Sends local progress (by now only this account's) and merges the account's
// progress back in. Sending it doubles as a retry for any single-item push
// that failed earlier in this account's session.
export async function syncProgress(api: ProgressApi) {
  const server = await api.add(getAllProgress());
  mergeProgress(server);
}

// Called whenever the login state is known. Returns a cleanup function.
export function startProgressSync(sub: string | null, api: ProgressApi | null) {
  claimLocalProgress(sub);
  if (!sub || !api) {
    setRemoteProgress(null);
    return () => {};
  }

  setRemoteProgress((key: ProgressKey, id: string) => {
    // Already saved locally; if this fails, the next syncProgress resends it.
    api.add({ [key]: [id] }).catch((err) => console.warn("Progress push failed:", err));
  });
  syncProgress(api).catch((err) => console.warn("Progress sync failed:", err));

  return () => setRemoteProgress(null);
}
