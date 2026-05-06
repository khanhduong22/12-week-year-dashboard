"use client";

import { useSession } from "next-auth/react";
import { useCallback } from "react";

/**
 * Custom hook that wraps fetch with the user's JWT access token.
 * Usage:
 *   const authFetch = useAuthFetch();
 *   const res = await authFetch("/cycles");
 */
export function useAuthFetch() {
  const { data: session } = useSession();

  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const token = (session as any)?.accessToken;
      const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      return fetch(url, { ...options, headers });
    },
    [session]
  );

  return authFetch;
}
