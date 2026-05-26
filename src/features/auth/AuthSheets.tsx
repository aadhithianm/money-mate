"use client";

import React, { useState } from "react";
import { BottomSheet } from "@/shared/sheets/BottomSheet";
import { Input } from "@/shared/ui/Input";
import { Button } from "@/shared/ui/Button";
import { useAuthStore } from "@/stores/authStore";
import { Eye, EyeOff, Mail, Lock, User, Globe } from "lucide-react";

interface AuthSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitch: () => void;
}

// ─── Sign In Bottom Sheet ───────────────────────────────────────────────────

export const SignInSheet: React.FC<AuthSheetProps> = ({
  isOpen,
  onClose,
  onSwitch,
}) => {
  const { signInWithEmail, signInWithGoogle, sendPasswordResetEmail, loading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  // Validation state
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validate = () => {
    let valid = true;
    if (!email.includes("@")) {
      setEmailError("Please enter a valid email address");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!isRecovering && password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      valid = false;
    } else {
      setPasswordError("");
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (isRecovering) {
        await sendPasswordResetEmail(email);
        setResetSent(true);
      } else {
        await signInWithEmail(email, password);
        onClose();
      }
    } catch (err) {
      // Error handled by store
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      onClose();
    } catch (err) {
      // Error handled by store
    }
  };

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setEmailError("");
    setPasswordError("");
    setIsRecovering(false);
    setResetSent(false);
    clearError();
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title={isRecovering ? "Recover Account" : "Sign In"} snapPoints={[0.65, 0.95]}>
      {isRecovering && resetSent ? (
        <div className="space-y-5 text-center py-4">
          <div className="p-4 bg-emerald-950/20 text-emerald-400 border border-emerald-900/40 rounded-lg text-xs leading-relaxed font-semibold">
            📧 Recovery link sent! Please check your email inbox to proceed resetting your password.
          </div>
          <Button
            variant="outline"
            fullWidth
            onClick={() => {
              setIsRecovering(false);
              setResetSent(false);
              clearError();
            }}
          >
            Back to Sign In
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-xs bg-red-950/20 text-red-400 border border-red-900/40 rounded-lg text-center font-medium">
              {error}
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                onBlur={() => {
                  if (email && !email.includes("@")) {
                    setEmailError("Please enter a valid email address");
                  }
                }}
                error={!!emailError}
                className="pl-11"
                disabled={loading}
                autoComplete="email"
                required
              />
            </div>
            {emailError && <p className="text-[10px] font-medium text-destructive">{emailError}</p>}
          </div>

          {!isRecovering ? (
            <>
              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRecovering(true);
                      clearError();
                    }}
                    className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 cursor-pointer"
                  >
                    Forgot?
                  </button>
                </div>
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
                    onBlur={() => {
                      if (password && password.length < 6) {
                        setPasswordError("Password must be at least 6 characters");
                      }
                    }}
                    error={!!passwordError}
                    className="pl-11 pr-11"
                    disabled={loading}
                    autoComplete="current-password"
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

              {/* Submit email/password */}
              <Button variant="primary" type="submit" fullWidth size="lg" loading={loading}>
                Sign In
              </Button>

              {/* Divider */}
              <div className="relative flex items-center justify-center py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/40" />
                </div>
                <span className="relative bg-card px-3 text-[10px] uppercase font-bold text-muted-foreground">
                  Or Sync With
                </span>
              </div>

              {/* Google OAuth Button */}
              <Button
                variant="outline"
                type="button"
                fullWidth
                size="lg"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="space-x-2"
              >
                <Globe className="h-4 w-4" />
                <span>Google Account</span>
              </Button>

              {/* Switch back link */}
              <p className="text-center text-xs text-muted-foreground pt-2">
                New to Money Mate?{" "}
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onSwitch();
                  }}
                  className="text-foreground font-bold hover:underline cursor-pointer"
                >
                  Create Account
                </button>
              </p>
            </>
          ) : (
            <div className="space-y-3 pt-2">
              <Button variant="primary" type="submit" fullWidth size="lg" loading={loading}>
                Send Reset Link
              </Button>
              <Button
                variant="outline"
                type="button"
                fullWidth
                size="lg"
                onClick={() => {
                  setIsRecovering(false);
                  clearError();
                }}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          )}
        </form>
      )}
    </BottomSheet>
  );
};

// ─── Sign Up Bottom Sheet ───────────────────────────────────────────────────

export const SignUpSheet: React.FC<AuthSheetProps> = ({
  isOpen,
  onClose,
  onSwitch,
}) => {
  const { signUpWithEmail, signInWithGoogle, loading, error, clearError } = useAuthStore();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Validation state
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validate = () => {
    let valid = true;
    if (fullName.trim().length === 0) {
      setNameError("Full name is required");
      valid = false;
    } else {
      setNameError("");
    }

    if (!email.includes("@")) {
      setEmailError("Please enter a valid email address");
      valid = false;
    } else {
      setEmailError("");
    }

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      valid = false;
    } else {
      setPasswordError("");
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await signUpWithEmail(email, password, fullName);
      onClose();
    } catch (err) {
      // Error handled by store
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signInWithGoogle();
      onClose();
    } catch (err) {
      // Error handled by store
    }
  };

  const handleClose = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setNameError("");
    setEmailError("");
    setPasswordError("");
    clearError();
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title="Create Account" snapPoints={[0.7, 0.95]}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-red-950/20 text-red-400 border border-red-900/40 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        {/* Full Name Field */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Your Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (nameError) setNameError("");
              }}
              onBlur={() => {
                if (fullName && !fullName.trim()) {
                  setNameError("Full name is required");
                }
              }}
              error={!!nameError}
              className="pl-11"
              disabled={loading}
              autoComplete="name"
              required
            />
          </div>
          {nameError && <p className="text-[10px] font-medium text-destructive">{nameError}</p>}
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-muted-foreground" />
            <Input
              type="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              onBlur={() => {
                if (email && !email.includes("@")) {
                  setEmailError("Please enter a valid email address");
                }
              }}
              error={!!emailError}
              className="pl-11"
              disabled={loading}
              autoComplete="email"
              required
            />
          </div>
          {emailError && <p className="text-[10px] font-medium text-destructive">{emailError}</p>}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Password
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
              onBlur={() => {
                if (password && password.length < 6) {
                  setPasswordError("Password must be at least 6 characters");
                }
              }}
              error={!!passwordError}
              className="pl-11 pr-11"
              disabled={loading}
              autoComplete="new-password"
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

        {/* Submit */}
        <Button variant="primary" type="submit" fullWidth size="lg" loading={loading}>
          Register
        </Button>

        {/* Divider */}
        <div className="relative flex items-center justify-center py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/40" />
          </div>
          <span className="relative bg-card px-3 text-[10px] uppercase font-bold text-muted-foreground">
            Or Sign Up With
          </span>
        </div>

        {/* Google OAuth Button */}
        <Button
          variant="outline"
          type="button"
          fullWidth
          size="lg"
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="space-x-2"
        >
          <Globe className="h-4 w-4" />
          <span>Google Account</span>
        </Button>

        {/* Switch back link */}
        <p className="text-center text-xs text-muted-foreground pt-2">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => {
              handleClose();
              onSwitch();
            }}
            className="text-foreground font-bold hover:underline cursor-pointer"
          >
            Sign In
          </button>
        </p>
      </form>
    </BottomSheet>
  );
};
