import type { Session, User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  currency: string;
  locale: string;
  first_day_of_week: 0 | 1;
}

export interface AuthState {
  user: User | MockUser | null;
  session: Session | MockSession | null;
  initialized: boolean;
  isDemoMode: boolean;
  loading: boolean;
  error: string | null;
}

// ─── Mock Types for Demo Mode ────────────────────────────────────────────────

export interface MockUser {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
  aud: string;
  created_at: string;
  app_metadata: Record<string, unknown>;
}

export interface MockSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: MockUser;
}
