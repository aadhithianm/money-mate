"use client";

import React from "react";
import { cn } from "@/utils/styles";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "rounded-md bg-secondary animate-pulse",
        className
      )}
      {...props}
    />
  );
};

export const LoadingSkeletonList: React.FC = () => {
  return (
    <div className="space-y-4 px-4 py-2 select-none">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center justify-between py-3 border-b border-border/20 last:border-b-0">
          <div className="flex items-center space-x-3.5 flex-1 min-w-0">
            {/* Left Circle Icon Skeleton */}
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            
            {/* Text Skeletons */}
            <div className="flex-1 space-y-2 min-w-0">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-3 w-40 rounded" />
            </div>
          </div>

          {/* Right Suffix amount skeleton */}
          <Skeleton className="h-4.5 w-16 rounded ml-4" />
        </div>
      ))}
    </div>
  );
};
export default Skeleton;
