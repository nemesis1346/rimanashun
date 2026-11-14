"use client";

import { useEffect } from "react";
import { getAccessToken, useUser } from "@auth0/nextjs-auth0";
import { createProgressApi, startProgressSync } from "@/lib/progressSync";

// Mounted once in Providers. Waits until the login state is known, then
// syncs progress for the logged-in user (or clears an account's progress
// after logout). See lib/progressSync.ts.
export default function ProgressSync() {
  const { user, isLoading, error } = useUser();
  const sub = user?.sub ?? null;

  useEffect(() => {
    // An error here means "couldn't tell", not "logged out": don't clear
    // anything on a flaky network.
    if (isLoading || error) return;
    return startProgressSync(sub, sub ? createProgressApi(() => getAccessToken()) : null);
  }, [sub, isLoading, error]);

  return null;
}
