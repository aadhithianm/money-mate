"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useAnimation, PanInfo } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/utils/styles";

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  snapPoints?: number[]; // Fraction values of window height (e.g., [0.4, 0.8, 0.95])
  defaultSnapIndex?: number;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  snapPoints = [0.5, 0.9], // Default: half-height and near full-screen
  defaultSnapIndex = 0,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const [windowHeight, setWindowHeight] = useState(0);
  const [activeSnapIndex, setActiveSnapIndex] = useState(defaultSnapIndex);

  // Focus trap ref
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Track window size for snapping calculation
  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowHeight(window.innerHeight);
      const handleResize = () => setWindowHeight(window.innerHeight);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // Map snap fractional values to pixel values from bottom
  // A snap point of 0.5 means y is 0.5 * windowHeight (50% up from bottom)
  // Inside Framer Motion, y=0 represents fully expanded (snapPoints[max]).
  // We can calculate actual y offsets where yOffset = windowHeight - (snapPoint * windowHeight)
  const actualSnapOffsets = snapPoints.map(
    (point) => windowHeight - point * windowHeight
  );

  // Animate to standard active snap index when sheet opens
  useEffect(() => {
    if (isOpen && windowHeight > 0) {
      const targetY = actualSnapOffsets[activeSnapIndex];
      controls.start({ y: targetY });
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, windowHeight, activeSnapIndex, controls]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle focus lock for accessibility
  useEffect(() => {
    if (isOpen) {
      // Small timeout to allow animation to start before focus shifts
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const dragY = info.point.y;
    
    // If swiped down rapidly, dismiss the sheet entirely
    if (info.velocity.y > 600 && info.offset.y > 60) {
      onClose();
      return;
    }

    // Determine the closest snap point
    let closestIndex = activeSnapIndex;
    let minDistance = Infinity;

    actualSnapOffsets.forEach((offset, index) => {
      // Calculate how close the current drag position is to the snap offset
      const dist = Math.abs((windowHeight - dragY) - (windowHeight - offset));
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = index;
      }
    });

    // If dragged too far below the lowest snap point, close the sheet
    const lowestOffset = actualSnapOffsets[0];
    const thresholdToClose = lowestOffset + 120;
    
    if (dragY > thresholdToClose) {
      onClose();
    } else {
      setActiveSnapIndex(closestIndex);
      controls.start({ y: actualSnapOffsets[closestIndex] });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/50 backdrop-blur-xs z-50 transition-colors"
          />

          {/* Sliding Bottom Drawer */}
          <motion.div
            ref={containerRef}
            initial={{ y: "100%" }}
            animate={controls}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 32 }}
            drag="y"
            dragConstraints={{ top: actualSnapOffsets[snapPoints.length - 1], bottom: windowHeight }}
            dragElastic={0.05}
            onDragEnd={handleDragEnd}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sheet-title"
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-card rounded-t-xl shadow-premium-xl border-t border-border/40 select-none pb-[calc(16px+var(--spacing-safe-bottom))] overflow-hidden flex flex-col focus:outline-none transition-colors"
            )}
            style={{
              height: `${Math.max(...snapPoints) * 100}vh`,
            }}
          >
            {/* Grab / Drag Handle */}
            <div className="w-full flex flex-col items-center py-3 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 bg-muted-foreground/25 rounded-full" />
            </div>

            {/* Header Area */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-border/40 flex-shrink-0">
              <h3 id="sheet-title" className="text-sm font-semibold text-foreground">
                {title || "Quick Action"}
              </h3>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="p-1 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer touch-target flex items-center justify-center"
                aria-label="Close sheet"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable sheet body content (keyboard push safe via simple browser adapt) */}
            <div className="px-4 py-4 overflow-y-auto no-scrollbar flex-1 select-text">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BottomSheet;
