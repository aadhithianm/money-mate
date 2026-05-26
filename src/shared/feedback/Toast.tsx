"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useUIStore, ToastItem } from "@/stores/uiStore";
import { cn } from "@/utils/styles";

interface ToastProps {
  toast: ToastItem;
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  const { removeToast } = useUIStore();
  const { id, message, type, duration = 3000 } = toast;

  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, removeToast]);

  const icons = {
    success: <CheckCircle2 className="h-4.5 w-4.5 text-income" />,
    error: <AlertCircle className="h-4.5 w-4.5 text-expense" />,
    info: <Info className="h-4.5 w-4.5 text-transfer" />,
    warning: <AlertCircle className="h-4.5 w-4.5 text-orange-500" />,
  };

  const borders = {
    success: "border-income/20 bg-card",
    error: "border-expense/20 bg-card",
    info: "border-transfer/20 bg-card",
    warning: "border-orange-500/20 bg-card",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ type: "spring", stiffness: 450, damping: 30 }}
      className={cn(
        "flex items-center justify-between p-3.5 rounded-lg border shadow-premium-lg max-w-sm w-full select-none select-text pointer-events-auto",
        borders[type]
      )}
    >
      <div className="flex items-center space-x-3 min-w-0">
        {icons[type]}
        <span className="text-xs font-medium text-foreground leading-snug">{message}</span>
      </div>
      <button
        onClick={() => removeToast(id)}
        className="p-1 -mr-1 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer ml-3 flex items-center justify-center flex-shrink-0"
        aria-label="Close alert"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
};

export const ToastProvider: React.FC = () => {
  const { toasts } = useUIStore();

  return (
    <div className="fixed bottom-0 right-0 left-0 md:left-auto md:right-4 z-[100] flex flex-col space-y-2 pointer-events-none max-w-sm w-full mx-auto md:mx-0 p-4 pb-20 md:pb-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};
export default ToastProvider;
