"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/shared/ui/Input";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Wallet, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { updatePassword, loading, error, clearError } = useAuth();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  // Validation
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const validate = () => {
    let valid = true;
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (password !== confirmPassword) {
      setConfirmError("Passwords do not match");
      valid = false;
    } else {
      setConfirmError("");
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await updatePassword(password);
      setSuccess(true);
      setTimeout(() => {
        router.replace("/");
      }, 2000);
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-white relative overflow-hidden flex flex-col justify-between px-4 py-8 select-none">
      {/* Background glow */}
      <div className="absolute top-[-10%] left-[-20%] w-[80vw] h-[80vw] max-w-[600px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="w-full flex items-center justify-center max-w-xl mx-auto z-10">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
            <Wallet className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-xs font-bold tracking-widest text-zinc-300">
            MONEY MATE
          </span>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full py-12 z-10">
        <Card className="p-6 bg-zinc-950/40 border border-white/5 rounded-xl shadow-premium-xl space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold tracking-tight">
              Reset Your Password
            </h2>
            <p className="text-xs text-zinc-400">
              Type and confirm a strong, secure new password for your personal ledger account.
            </p>
          </div>

          {success ? (
            <div className="space-y-4 text-center py-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-emerald-400">Password Updated</p>
                <p className="text-[10px] text-zinc-400">Redirecting to Money Mate dashboard...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-xs bg-red-950/20 text-red-400 border border-red-900/40 rounded-lg text-center font-medium">
                  {error}
                </div>
              )}

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError("");
                    }}
                    error={!!passwordError}
                    className="pl-11 pr-11 text-xs"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
                {passwordError && <p className="text-[10px] font-medium text-destructive">{passwordError}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (confirmError) setConfirmError("");
                    }}
                    error={!!confirmError}
                    className="pl-11 pr-11 text-xs"
                    disabled={loading}
                    required
                  />
                </div>
                {confirmError && <p className="text-[10px] font-medium text-destructive">{confirmError}</p>}
              </div>

              {/* Submit */}
              <Button variant="primary" type="submit" fullWidth size="lg" loading={loading} className="font-bold text-xs bg-white text-black hover:bg-zinc-200">
                Update Password
              </Button>
            </form>
          )}
        </Card>
      </main>

      {/* Footer */}
      <footer className="w-full text-center max-w-xl mx-auto z-10">
        <p className="text-[9px] font-bold tracking-widest text-zinc-600 uppercase">
          🔒 Production-grade local encryption active
        </p>
      </footer>
    </div>
  );
}
