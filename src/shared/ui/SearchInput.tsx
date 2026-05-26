"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/utils/styles";

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onClear, value, onChange, ...props }, ref) => {
    const showClear = !!value && !!onClear;

    return (
      <div className="relative flex items-center w-full">
        <Search className="absolute left-3.5 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
        <input
          ref={ref}
          value={value}
          onChange={onChange}
          className={cn(
            "flex w-full rounded-md border border-border bg-card pl-10 pr-10 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-premium-sm touch-target",
            className
          )}
          {...props}
        />
        {showClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 p-1 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";
