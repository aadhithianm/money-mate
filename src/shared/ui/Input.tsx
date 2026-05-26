"use client";

import React from "react";
import { cn } from "@/utils/styles";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex w-full rounded-md border border-border bg-card px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-premium-sm touch-target",
          error && "border-destructive focus:border-destructive focus:ring-destructive",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
