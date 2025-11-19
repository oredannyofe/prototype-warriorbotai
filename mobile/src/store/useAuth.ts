import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  token: string | null;
  userId: number | null; // simplify for MVP
  setAuth: (token: string, userId: number) => Promise<void>;
  hydrate: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  token: null,
  userId: null,
  setAuth: async (token, userId) => {
    await SecureStore.setItemAsync('authToken', token);
    await SecureStore.setItemAsync('userId', String(userId));
    set({ token, userId });
  },
  hydrate: async () => {
    const token = await SecureStore.getItemAsync('authToken');
    const uid = await SecureStore.getItemAsync('userId');
    set({ token: token || null, userId: uid ? Number(uid) : null });
  },
  logout: async () => {
    await SecureStore.deleteItemAsync('authToken');
    await SecureStore.deleteItemAsync('userId');
    set({ token: null, userId: null });
  },
}));
