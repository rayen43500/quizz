import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import api, { setToken } from '../api/client';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string | null;
  institution?: string;
  topicsProgress?: { topic: string; masteryPercent: number }[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Record<string, string>) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'quisi_token';

async function getStoredToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return window?.localStorage?.getItem(TOKEN_KEY) ?? null;
    } catch {
      return null;
    }
  }

  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function setStoredToken(value: string) {
  if (Platform.OS === 'web') {
    try {
      window?.localStorage?.setItem(TOKEN_KEY, value);
    } catch {
      // Ignore storage errors on web.
    }
    return;
  }

  await SecureStore.setItemAsync(TOKEN_KEY, value);
}

async function clearStoredToken() {
  if (Platform.OS === 'web') {
    try {
      window?.localStorage?.removeItem(TOKEN_KEY);
    } catch {
      // Ignore storage errors on web.
    }
    return;
  }

  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const t = await getStoredToken();
        if (t) {
          setToken(t);
          try {
            const { data } = await api.get('/auth/me');
            setUser(data.user);
          } catch {
            await clearStoredToken();
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    await setStoredToken(data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (formData: Record<string, string>) => {
    const { data } = await api.post('/auth/register', { ...formData, role: 'student' });
    await setStoredToken(data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = async () => {
    await clearStoredToken();
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    const { data } = await api.get('/auth/me');
    setUser(data.user);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth required');
  return ctx;
}
