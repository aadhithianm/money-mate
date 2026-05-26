"use client";

import React, { useState } from "react";
import { cn } from "@/utils/styles";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback: string;
  size?: "sm" | "md" | "lg";
}

export const Avatar: React.FC<AvatarProps> = ({
  className,
  src,
  alt = "avatar",
  fallback,
  size = "md",
  ...props
}) => {
  const [error, setError] = useState(false);

  const sizes = {
    sm: "h-8 w-8 text-xs font-medium",
    md: "h-10 w-10 text-sm font-semibold",
    lg: "h-14 w-14 text-base font-semibold",
  };

  const getInitials = (name: string) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full bg-secondary font-semibold text-muted-foreground select-none items-center justify-center border border-border/40",
        sizes[size],
        className
      )}
      {...props}
    >
      {src && !error ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setError(true)}
          className="h-full w-full aspect-square object-cover"
        />
      ) : (
        <span>{getInitials(fallback)}</span>
      )}
    </div>
  );
};
