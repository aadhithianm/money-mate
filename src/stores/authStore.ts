import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";
import type { MockUser, MockSession } from "@/types/auth";

interface AuthState {
  user: User | MockUser | null;
  session: Session | MockSession | null;
  initialized: boolean;
  isDemoMode: boolean;
  loading: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  startDemoMode: () => void;
  logout: () => Promise<void>;
  clearError: () => void;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

// Check if credentials are placeholder URLs
const isMockSupabase =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-url") ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("placeholder-anon-key");

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  initialized: false,
  isDemoMode: false,
  loading: false,
  error: null,

  initialize: async () => {
    if (get().initialized) return;

    try {
      // 1. Check local storage for demo mode persistence
      const savedDemoMode = localStorage.getItem("money-mate-demo-mode") === "true";
      if (savedDemoMode) {
        const mockUser: MockUser = {
          id: "demo-user-id",
          email: "demo@moneymate.local",
          user_metadata: { full_name: "Demo Account" },
          aud: "authenticated",
          created_at: new Date().toISOString(),
          app_metadata: {},
        };
        const mockSession: MockSession = {
          access_token: "demo-token",
          refresh_token: "demo-refresh-token",
          expires_in: 3600,
          token_type: "bearer",
          user: mockUser,
        };
        set({
          user: mockUser,
          session: mockSession,
          isDemoMode: true,
          initialized: true,
        });
        return;
      }

      // 2. Try Supabase Auth session fetch if not mock
      if (!isMockSupabase) {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session) {
          set({
            user: session.user,
            session,
            isDemoMode: false,
          });
        }
      }
    } catch (err: any) {
      console.error("[AuthStore] Initialization failed:", err);
      set({ error: err.message || "Session recovery failed" });
    } finally {
      set({ initialized: true });
    }
  },

  signInWithEmail: async (email, password) => {
    set({ loading: true, error: null });
    try {
      if (isMockSupabase) {
        // Mock authentication for development / sandbox testing
        await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate delay
        if (password.length < 6) {
          throw new Error("Invalid password (must be at least 6 characters)");
        }
        const mockUser: MockUser = {
          id: crypto.randomUUID(),
          email,
          user_metadata: { full_name: email.split("@")[0] },
          aud: "authenticated",
          created_at: new Date().toISOString(),
          app_metadata: {},
        };
        const mockSession: MockSession = {
          access_token: "mock-jwt",
          refresh_token: "mock-refresh",
          expires_in: 3600,
          token_type: "bearer",
          user: mockUser,
        };
        set({ user: mockUser, session: mockSession, isDemoMode: false });
        localStorage.setItem("money-mate-auth-mode", "mock");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        set({ user: data.user, session: data.session, isDemoMode: false });
      }
    } catch (err: any) {
      set({ error: err.message || "Sign in failed" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  signUpWithEmail: async (email, password, fullName) => {
    set({ loading: true, error: null });
    try {
      if (isMockSupabase) {
        await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate delay
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters long");
        }
        const mockUser: MockUser = {
          id: crypto.randomUUID(),
          email,
          user_metadata: { full_name: fullName || email.split("@")[0] },
          aud: "authenticated",
          created_at: new Date().toISOString(),
          app_metadata: {},
        };
        const mockSession: MockSession = {
          access_token: "mock-jwt",
          refresh_token: "mock-refresh",
          expires_in: 3600,
          token_type: "bearer",
          user: mockUser,
        };
        set({ user: mockUser, session: mockSession, isDemoMode: false });
        localStorage.setItem("money-mate-auth-mode", "mock");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || email.split("@")[0],
            },
          },
        });
        if (error) throw error;
        set({ user: data.user, session: data.session, isDemoMode: false });
      }
    } catch (err: any) {
      set({ error: err.message || "Registration failed" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  signInWithGoogle: async () => {
    set({ loading: true, error: null });
    try {
      if (isMockSupabase) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        // Mock Google sign-in
        const mockUser: MockUser = {
          id: crypto.randomUUID(),
          email: "google.tester@gmail.com",
          user_metadata: {
            full_name: "Google Sandbox Tester",
            avatar_url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=tester",
          },
          aud: "authenticated",
          created_at: new Date().toISOString(),
          app_metadata: {},
        };
        const mockSession: MockSession = {
          access_token: "mock-google-jwt",
          refresh_token: "mock-google-refresh",
          expires_in: 3600,
          token_type: "bearer",
          user: mockUser,
        };
        set({ user: mockUser, session: mockSession, isDemoMode: false });
      } else {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: typeof window !== "undefined" ? `${window.location.origin}/` : undefined,
          },
        });
        if (error) throw error;
      }
    } catch (err: any) {
      set({ error: err.message || "Google OAuth failed" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  startDemoMode: () => {
    const mockUser: MockUser = {
      id: "demo-user-id",
      email: "demo@moneymate.local",
      user_metadata: { full_name: "Demo Account" },
      aud: "authenticated",
      created_at: new Date().toISOString(),
      app_metadata: {},
    };
    const mockSession: MockSession = {
      access_token: "demo-token",
      refresh_token: "demo-refresh-token",
      expires_in: 3600,
      token_type: "bearer",
      user: mockUser,
    };

    localStorage.setItem("money-mate-demo-mode", "true");
    set({
      user: mockUser,
      session: mockSession,
      isDemoMode: true,
      error: null,
    });
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      localStorage.removeItem("money-mate-demo-mode");
      localStorage.removeItem("money-mate-auth-mode");

      if (!isMockSupabase) {
        await supabase.auth.signOut();
      }

      set({ user: null, session: null, isDemoMode: false });
    } catch (err: any) {
      set({ error: err.message || "Logout failed" });
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),

  sendPasswordResetEmail: async (email) => {
    set({ loading: true, error: null });
    try {
      if (isMockSupabase) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        console.log(`[Mock Auth] Reset email sent to ${email}`);
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      set({ error: err.message || "Failed to send reset email" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  updatePassword: async (password) => {
    set({ loading: true, error: null });
    try {
      if (isMockSupabase) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        console.log(`[Mock Auth] Password successfully updated`);
      } else {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
      }
    } catch (err: any) {
      set({ error: err.message || "Failed to update password" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
}));
