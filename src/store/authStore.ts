import { create } from "zustand";
import api from "@/lib/api";

type AuthState = {
  token: string | null;
  user: { id: string; email: string; name?: string } | null;
  initialize: () => void;
  setToken: (token: string | null) => void;
  setUser: (user: AuthState["user"]) => void;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  isTokenValid: () => boolean;
};

// Helper function to check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch {
    return true;
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null, // Start with null to avoid hydration mismatch
  user: null,
  initialize: () => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        set({ token: storedToken });
      }
    }
  },
  setToken: (token) => {
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("token", token);
        const secure = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `token=${token}; Path=/; SameSite=Lax${secure}`;
      } else {
        localStorage.removeItem("token");
        // expire cookie
        document.cookie = 'token=; Path=/; Max-Age=0';
      }
    }
    set({ token });
  },
  setUser: (user) => set({ user }),
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      document.cookie = 'token=; Path=/; Max-Age=0';
    }
    set({ token: null, user: null });
  },
  refreshToken: async () => {
    try {
      const currentToken = get().token;
      if (!currentToken) return false;

      const response = await api.post("/auth/refresh-token");
      const { token: newToken } = response.data.data;
      
      if (newToken) {
        get().setToken(newToken);
        return true;
      }
      return false;
    } catch (error: unknown) {
      console.error('Refresh token failed:', error);
      return false;
    }
  },
  isTokenValid: () => {
    const token = get().token;
    if (!token) return false;
    return !isTokenExpired(token);
  },
}));

// Expose store globally in development for debugging
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as unknown as Record<string, unknown>).__AUTH_STORE__ = useAuthStore;
}


