// hooks/useBack.ts
"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useEffect } from "react";

/**
 * useBack — always goes to the correct previous page.
 *
 * Strategy:
 *  1. If there is real browser history (came from inside the app) → router.back()
 *  2. If the user landed directly on this page (no history) → go to fallback URL
 *
 * Usage:
 *   const goBack = useBack("/");          // fallback = home
 *   const goBack = useBack("/cart");      // fallback = cart
 *   <button onClick={goBack}>Back</button>
 */
export function useBack(fallback: string = "/") {
  const router = useRouter();
  // Track whether we have navigated within the app
  const hasHistory = useRef(false);

  useEffect(() => {
    // If window.history.length > 1 the browser has previous entries
    if (typeof window !== "undefined" && window.history.length > 1) {
      hasHistory.current = true;
    }
  }, []);

  const goBack = useCallback(() => {
    if (hasHistory.current) {
      router.back();
    } else {
      router.push(fallback);
    }
  }, [router, fallback]);

  return goBack;
}