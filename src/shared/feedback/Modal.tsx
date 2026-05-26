"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/utils/styles";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Esc key close and lock scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/60 backdrop-blur-xs z-50 transition-colors"
          />

          {/* Modal Content container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 450, damping: 30 }}
              role="dialog"
              aria-modal="true"
              className={cn(
                "w-full max-w-md bg-card rounded-lg border border-border/40 shadow-premium-xl select-none overflow-hidden flex flex-col focus:outline-none transition-colors"
              )}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
                <h3 className="text-sm font-semibold text-foreground">
                  {title || "Confirmation"}
                </h3>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer touch-target flex items-center justify-center"
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-5 py-5 overflow-y-auto no-scrollbar flex-1 text-sm text-foreground select-text">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
export default Modal;
