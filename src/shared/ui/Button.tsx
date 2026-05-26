"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/utils/styles";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "income" | "expense" | "transfer";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer touch-target";
    
    const variants = {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-premium-sm",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-secondary text-foreground hover:text-foreground",
      outline: "border border-border bg-transparent text-foreground hover:bg-secondary",
      income: "bg-income text-white hover:bg-income/90 shadow-premium-sm",
      expense: "bg-expense text-white hover:bg-expense/90 shadow-premium-sm",
      transfer: "bg-transfer text-white hover:bg-transfer/90 shadow-premium-sm",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs rounded-sm",
      md: "px-5 py-2.5 text-sm rounded-md",
      lg: "px-7 py-3 text-base rounded-lg",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={disabled || loading ? undefined : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 600, damping: 30 }}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          loading && "relative text-transparent transition-none",
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {children}
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center text-current">
            <svg
              className="animate-spin h-5 w-5 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
