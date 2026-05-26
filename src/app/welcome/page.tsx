"use client";

import React, { useState } from "react";
import { Button } from "@/shared/ui/Button";
import { useAuthStore } from "@/stores/authStore";
import { SignInSheet, SignUpSheet } from "@/features/auth/AuthSheets";
import { Wallet, ArrowRight, Tv, Shield, Eye } from "lucide-react";

export default function WelcomePage() {
  const { startDemoMode } = useAuthStore();
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#080809] text-white relative overflow-hidden flex flex-col justify-between px-6 py-10 select-none">
      {/* ─── Ambient Sage Green & Sand Gold Ambient Glows ────────────────────── */}
      <div className="absolute top-[-15%] left-[-15%] w-[90vw] h-[90vw] max-w-[550px] rounded-full bg-emerald-600/3 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[90vw] h-[90vw] max-w-[550px] rounded-full bg-amber-500/2 blur-[130px] pointer-events-none" />

      {/* ─── Minimal Header ─────────────────────────────────────────────────── */}
      <header className="w-full flex items-center justify-between max-w-xl mx-auto z-10">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
            <Wallet className="h-4 w-4 text-emerald-400 opacity-90" />
          </div>
          <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-300">
            MONEY MATE
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSignInOpen(true)}
          className="text-zinc-400 hover:text-white font-semibold text-xs border border-white/0 hover:border-white/5 hover:bg-white/5 px-3 py-1.5 rounded-lg transition-all"
        >
          Sign In
        </Button>
      </header>

      {/* ─── Editorial Hero Content ────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full py-16 z-10 space-y-12">
        <div className="space-y-6">
          <h1 className="text-3xl md:text-4xl font-light tracking-tight leading-[1.15] text-zinc-100 lowercase">
            financial tranquility,<br />
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400">
              offline-first.
            </span>
          </h1>
          
          <p className="text-xs md:text-sm text-zinc-400 font-medium leading-relaxed max-w-md">
            An ultra-minimal, premium personal ledger engineered for absolute focus, zero latency, and absolute privacy.
          </p>
        </div>

        {/* Calm Touch Action CTAs */}
        <div className="flex flex-col space-y-3">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => setSignUpOpen(true)}
            className="font-bold text-xs bg-white text-black hover:bg-zinc-200 h-13 shadow-premium-sm transition-all rounded-lg"
          >
            <span>Get Started</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="lg"
            fullWidth
            onClick={startDemoMode}
            className="font-bold text-xs text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 h-13 transition-all rounded-lg"
          >
            <Tv className="mr-2 h-4 w-4 text-zinc-400" />
            <span>Try Demo Mode (Instant Sandbox)</span>
          </Button>
        </div>

        {/* Minimal Feature Highlights (Ultra Calm & Dashboard-Free) */}
        <div className="space-y-4 pt-4 border-t border-white/5">
          <div className="flex items-center space-x-3.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
            <span className="text-xs font-semibold tracking-wide text-zinc-300">
              zero latency local-first engine (Dexie.js)
            </span>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.4)]" />
            <span className="text-xs font-semibold tracking-wide text-zinc-300">
              end-to-end sync and session recovery (Supabase)
            </span>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.4)]" />
            <span className="text-xs font-semibold tracking-wide text-zinc-300">
              optimized for natural thumb touch gestures
            </span>
          </div>
        </div>
      </main>

      {/* ─── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="w-full text-center max-w-xl mx-auto z-10">
        <p className="text-[9px] font-bold tracking-[0.2em] text-zinc-600 uppercase">
          🔒 Production-grade local encryption active
        </p>
      </footer>

      {/* ─── Auth Drawer sheets ───────────────────────────────────────────────── */}
      <SignInSheet
        isOpen={signInOpen}
        onClose={() => setSignInOpen(false)}
        onSwitch={() => setSignUpOpen(true)}
      />
      <SignUpSheet
        isOpen={signUpOpen}
        onClose={() => setSignUpOpen(false)}
        onSwitch={() => setSignInOpen(true)}
      />
    </div>
  );
}
