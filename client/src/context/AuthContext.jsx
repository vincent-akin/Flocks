'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, ApiError } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [member, setMember] = useState(null);
  const [roleAssignments, setRoleAssignments] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | authenticated | unauthenticated

  const applySession = useCallback((res) => {
    setUser(res.data.user);
    setMember(res.data.member);
    setRoleAssignments(res.data.roleAssignments || []);
    setStatus('authenticated');
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setMember(null);
    setRoleAssignments([]);
    setStatus('unauthenticated');
  }, []);

  /**
   * Loads the current session. If the short-lived access token has
   * expired, transparently tries the refresh endpoint once (which reads
   * the longer-lived refresh cookie) before giving up - this is what
   * keeps someone logged in across a normal browsing session without
   * forcing a re-login every 15 minutes.
   */
  const refresh = useCallback(async () => {
    try {
      const res = await authApi.me();
      applySession(res);
      return true;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        try {
          await authApi.refresh();
          const res = await authApi.me();
          applySession(res);
          return true;
        } catch (refreshErr) {
          clearSession();
          return false;
        }
      }
      clearSession();
      return false;
    }
  }, [applySession, clearSession]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, member, roleAssignments, status, refresh, logout }),
    [user, member, roleAssignments, status, refresh, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
