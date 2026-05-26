"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useAuthStore } from "@/stores/authStore";
import { accountService } from "@/services/accountService";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Input } from "@/shared/ui/Input";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Coins,
  Wallet,
  CheckCircle,
  Briefcase,
  Utensils,
  Car
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { createWorkspace, switchWorkspace, loadWorkspaces } = useWorkspaceStore();
  const { user } = useAuthStore();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Workspace State
  const [workspaceName, setWorkspaceName] = useState("Personal Ledger");
  const [currency, setCurrency] = useState("USD");

  // Step 2: Account State
  const [accountName, setAccountName] = useState("Cash Wallet");
  const [accountType, setAccountType] = useState<
    "checking" | "savings" | "cash" | "credit" | "investment" | "other"
  >("cash");
  const [initialBalance, setInitialBalance] = useState("0");

  const currencies = [
    { code: "USD", symbol: "$", label: "US Dollar" },
    { code: "EUR", symbol: "€", label: "Euro" },
    { code: "GBP", symbol: "£", label: "British Pound" },
    { code: "INR", symbol: "₹", label: "Indian Rupee" },
    { code: "CAD", symbol: "$", label: "Canadian Dollar" },
    { code: "AUD", symbol: "$", label: "Australian Dollar" },
    { code: "JPY", symbol: "¥", label: "Japanese Yen" },
  ];

  const accountTypes = [
    { id: "cash", label: "Cash Wallet", icon: Coins },
    { id: "checking", label: "Checking", icon: Wallet },
    { id: "savings", label: "Savings", icon: CheckCircle },
    { id: "credit", label: "Credit Card", icon: Briefcase },
  ];

  // ─── Actions ───────────────────────────────────────────────────────────────

  const handleNext = () => {
    if (step === 1 && !workspaceName.trim()) return;
    if (step === 2 && !accountName.trim()) return;
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // 1. Create workspace
      const workspace = await createWorkspace(workspaceName, currency, true);

      // 2. Create first account under the new workspace
      const balanceInCents = Math.round(parseFloat(initialBalance || "0") * 100);
      await accountService.createAccount({
        workspace_id: workspace.id,
        name: accountName,
        type: accountType,
        balance: balanceInCents,
        currency: currency,
        is_default: true,
      });

      // 3. Reload workspaces and route to home
      await loadWorkspaces();
      if (workspace.id) {
        await switchWorkspace(workspace.id);
      }
      
      router.replace("/");
    } catch (err) {
      console.error("[Onboarding] Failed to finish onboarding:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSkipWithDefaults = async () => {
    setLoading(true);
    try {
      // Create Default Personal Workspace
      const workspace = await createWorkspace("Personal Workspace", "USD", true);

      // Create Default Cash Wallet
      await accountService.createAccount({
        workspace_id: workspace.id,
        name: "Cash Wallet",
        type: "cash",
        balance: 0,
        currency: "USD",
        is_default: true,
      });

      await loadWorkspaces();
      if (workspace.id) {
        await switchWorkspace(workspace.id);
      }

      router.replace("/");
    } catch (err) {
      console.error("[Onboarding] Failed to skip onboarding:", err);
    } finally {
      setLoading(false);
    }
  };

  // ─── UI Rendering ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-white relative overflow-hidden flex flex-col justify-between px-4 py-8 select-none">
      {/* Background glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* Top Header / Skip */}
      <header className="w-full flex items-center justify-between max-w-xl mx-auto z-10">
        <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
          Step {step} of 3
        </span>
        <button
          onClick={handleSkipWithDefaults}
          disabled={loading}
          className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-wider cursor-pointer"
        >
          Skip with Defaults
        </button>
      </header>

      {/* Main Body Forms */}
      <main className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full py-8 z-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase">
                  <Sparkles className="h-3 w-3" />
                  <span>Welcome To Money Mate</span>
                </div>
                <h2 className="text-xxl font-extrabold tracking-tight">
                  Establish Your Workspace
                </h2>
                <p className="text-[11px] md:text-xs text-zinc-400 leading-relaxed">
                  Workspaces keep transactions separated. Give your default ledger a clean name and select your standard reporting currency.
                </p>
              </div>

              {/* Workspace Name Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Ledger Name
                </label>
                <Input
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g. Personal Ledger, Family Trust"
                  disabled={loading}
                  maxLength={50}
                  required
                />
              </div>

              {/* Currency Picker Grid */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Default Reporting Currency
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {currencies.map((curr) => {
                    const isSelected = currency === curr.code;
                    return (
                      <button
                        key={curr.code}
                        type="button"
                        onClick={() => setCurrency(curr.code)}
                        className={`py-3 px-2 border rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold scale-[1.02]"
                            : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white"
                        }`}
                      >
                        <span className="text-sm font-bold font-mono">{curr.symbol}</span>
                        <span className="text-[10px] font-bold uppercase mt-1 tracking-wider">{curr.code}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-xxl font-extrabold tracking-tight">
                  Connect Your First Account
                </h2>
                <p className="text-[11px] md:text-xs text-zinc-400 leading-relaxed">
                  Every transaction belongs to an account. Let's create your first deposit source to record initial balances.
                </p>
              </div>

              {/* Account Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Account Name
                </label>
                <Input
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g. Chase Checking, Cash Wallet"
                  disabled={loading}
                  maxLength={50}
                  required
                />
              </div>

              {/* Account Type Grid Selector */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {accountTypes.map((type) => {
                    const isSelected = accountType === type.id;
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setAccountType(type.id as any)}
                        className={`py-3 px-3 border rounded-lg flex items-center space-x-3 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold scale-[1.01]"
                            : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white"
                        }`}
                      >
                        <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                        <span className="text-xs font-semibold">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Initial Balance */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Initial Starting Balance ({currency})
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-base font-bold font-mono text-zinc-500">
                    {currencies.find((c) => c.code === currency)?.symbol || "$"}
                  </span>
                  <Input
                    type="number"
                    pattern="[0-9]*"
                    inputMode="decimal"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    className="pl-8 text-sm font-bold font-mono"
                    disabled={loading}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-xxl font-extrabold tracking-tight">
                  Budget Categories Seeding
                </h2>
                <p className="text-[11px] md:text-xs text-zinc-400 leading-relaxed">
                  Money Mate automatically seeds standard expense and income categories, helping you organize transactions immediately upon creation.
                </p>
              </div>

              {/* Visual Grid of what gets seeded */}
              <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-4 space-y-4">
                <div>
                  <h4 className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    Sample Expense Categories (Seeded)
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full font-semibold flex items-center space-x-1">
                      <Utensils className="h-3 w-3 mr-1" /> Food
                    </span>
                    <span className="text-[10px] px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full font-semibold flex items-center space-x-1">
                      <Car className="h-3 w-3 mr-1" /> Transport
                    </span>
                    <span className="text-[10px] px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full font-semibold">
                      Leisure
                    </span>
                    <span className="text-[10px] px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full font-semibold">
                      Rent
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    Sample Income Categories (Seeded)
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full font-semibold">
                      Salary
                    </span>
                    <span className="text-[10px] px-2.5 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-full font-semibold">
                      Freelance
                    </span>
                    <span className="text-[10px] px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full font-semibold">
                      Investments
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 text-[11px] text-zinc-400 bg-zinc-950 border border-zinc-900 rounded-lg text-center font-medium leading-relaxed">
                💡 <span className="text-zinc-200">Pro-Tip</span>: You can fully customize, edit colors, or add infinite new categories at any time in settings later.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Wizard Controllers */}
      <footer className="w-full max-w-xl mx-auto z-10 flex space-x-3">
        {step > 1 && (
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={loading}
            className="flex-1 font-bold text-xs border border-zinc-800 text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span>Back</span>
          </Button>
        )}

        {step < 3 ? (
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={loading}
            className="flex-[2] font-bold text-xs bg-emerald-500 text-black hover:bg-emerald-400"
          >
            <span>Continue</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="income"
            onClick={handleFinish}
            loading={loading}
            className="flex-[2] font-bold text-xs bg-emerald-500 text-black hover:bg-emerald-400 shadow-premium-sm"
          >
            <span>Finish Setup</span>
            <Check className="ml-2 h-4 w-4" />
          </Button>
        )}
      </footer>
    </div>
  );
}
