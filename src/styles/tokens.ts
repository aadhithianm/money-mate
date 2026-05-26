/**
 * Money Mate - Production-grade Design System Tokens
 * Highly structured and TypeScript-safe design token configurations.
 */

export const tokens = {
  // Theme modes
  modes: ["light", "dark"] as const,

  // Semantic HSL configurations (mirrored in global css variables)
  colors: {
    light: {
      background: "hsl(210 20% 98%)",
      foreground: "hsl(224 71.4% 4.1%)",
      card: "hsl(0 0% 100%)",
      cardForeground: "hsl(224 71.4% 4.1%)",
      primary: "hsl(220 9% 10%)",
      primaryForeground: "hsl(210 20% 98%)",
      secondary: "hsl(220 14.3% 95.9%)",
      secondaryForeground: "hsl(220.9 39.3% 11%)",
      muted: "hsl(220 14.3% 95.9%)",
      mutedForeground: "hsl(220 8.9% 46.1%)",
      accent: "hsl(220 14.3% 95.9%)",
      accentForeground: "hsl(220.9 39.3% 11%)",
      border: "hsl(220 13% 91%)",
      input: "hsl(220 13% 91%)",
      ring: "hsl(224 71.4% 4.1%)",
      income: "hsl(142.1 76.2% 36.3%)",
      incomeForeground: "hsl(138 76% 97%)",
      expense: "hsl(346.8 77.2% 49.8%)",
      expenseForeground: "hsl(346 100% 98%)",
      transfer: "hsl(221.2 83.2% 53.3%)",
      transferForeground: "hsl(224 100% 98%)",
    },
    dark: {
      background: "hsl(240 10% 3.9%)",
      foreground: "hsl(0 0% 98%)",
      card: "hsl(240 10% 5.9%)",
      cardForeground: "hsl(0 0% 98%)",
      primary: "hsl(0 0% 98%)",
      primaryForeground: "hsl(240 5.9% 10%)",
      secondary: "hsl(240 3.7% 12%)",
      secondaryForeground: "hsl(0 0% 98%)",
      muted: "hsl(240 3.7% 12%)",
      mutedForeground: "hsl(240 5% 64.9%)",
      accent: "hsl(240 3.7% 12%)",
      accentForeground: "hsl(0 0% 98%)",
      border: "hsl(240 3.7% 12%)",
      input: "hsl(240 3.7% 12%)",
      ring: "hsl(240 4.9% 83.9%)",
      income: "hsl(142.1 70.6% 45.3%)",
      incomeForeground: "hsl(240 10% 3.9%)",
      expense: "hsl(346.8 62.8% 50.6%)",
      expenseForeground: "hsl(240 10% 3.9%)",
      transfer: "hsl(217.2 91.2% 59.8%)",
      transferForeground: "hsl(240 10% 3.9%)",
    }
  },

  // Apple/Notion typography scale
  typography: {
    fonts: {
      sans: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
      mono: "var(--font-geist-mono), ui-monospace, SFMono-Regular, monospace",
    },
    sizes: {
      xs: "0.75rem",    // 12px (captions, microtags)
      sm: "0.875rem",   // 14px (body text, lists, buttons)
      base: "1rem",     // 16px (large text inputs, subheaders)
      lg: "1.125rem",   // 18px (titles, modal headers)
      xl: "1.25rem",    // 20px (feed headers)
      xxl: "1.5rem",    // 24px (amount displays, summary headers)
      xxxl: "2rem",     // 32px (giant hero amounts)
    },
    weights: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },

  // Spacing system (4px-based grid optimized for thumb-reach layouts)
  spacing: {
    0: "0rem",
    0.5: "0.125rem", // 2px
    1: "0.25rem",    // 4px
    1.5: "0.375rem",  // 6px
    2: "0.5rem",     // 8px
    2.5: "0.625rem",  // 10px
    3: "0.75rem",    // 12px
    4: "1rem",       // 16px (standard pad)
    5: "1.25rem",    // 20px
    6: "1.5rem",     // 24px
    8: "2rem",       // 32px (large margin)
    10: "2.5rem",    // 40px
    12: "3rem",      // 48px (touch targets base)
    16: "4rem",      // 64px
    20: "5rem",      // 80px
  },

  // Radii for beautiful card corners and inputs
  radii: {
    xs: "4px",       // mini badges
    sm: "6px",       // tags, tight inputs
    md: "10px",      // default cards, primary buttons
    lg: "14px",      // large modals, sheets
    xl: "20px",      // high rounding elements
    full: "9999px",  // rounded pills/circles (avatars, action FABs)
  },

  // Apple-inspired premium soft shadows
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
    md: "0 4px 12px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)",
    lg: "0 12px 24px -4px rgba(0, 0, 0, 0.06), 0 4px 12px -2px rgba(0, 0, 0, 0.04)",
    xl: "0 24px 48px -8px rgba(0, 0, 0, 0.08), 0 12px 24px -4px rgba(0, 0, 0, 0.05)",
  },

  // Strict Layer Z-Index architecture
  zIndex: {
    base: 0,
    active: 1,
    header: 30,      // Sticky Header
    fab: 40,         // Centered floating action button
    bottomNav: 50,   // Mobile navigation
    sidebar: 50,     // Collapsible desktop sidebar
    overlay: 60,     // Dark backdrop overlay
    sheet: 70,       // Bottom sheet gesture drawer
    modal: 80,       // Global modal popup
    toast: 100,      // Alerts / Toasts
  },

  // Framer Motion spring physics / animations speeds
  motion: {
    springs: {
      default: { type: "spring", stiffness: 400, damping: 32 } as const,
      gentle: { type: "spring", stiffness: 300, damping: 28 } as const,
      bouncy: { type: "spring", stiffness: 500, damping: 20 } as const,
      stiff: { type: "spring", stiffness: 600, damping: 30 } as const,
    },
    durations: {
      fast: 0.15,      // micro-interactions (press scale, hover)
      normal: 0.25,    // page slides, sidebars
      slow: 0.4,       // large bottom sheet snaps, dialog fade-in
    },
    ease: [0.16, 1, 0.3, 1] as [number, number, number, number], // cubic-bezier timing
  }
} as const;

export type DesignTokens = typeof tokens;
