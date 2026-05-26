"use client";

import React from "react";
import { cn } from "@/utils/styles";

interface SectionTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ className, children, ...props }) => {
  return (
    <h2
      className={cn(
        "text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 px-4 mb-2 select-none",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  );
};
