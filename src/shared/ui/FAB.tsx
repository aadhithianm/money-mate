"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { cn } from "@/utils/styles";

export const FAB: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { openSheet } = useUIStore();

  const handleAction = (sheetType: "expense" | "income" | "transfer") => {
    setIsOpen(false);
    openSheet(sheetType);
  };

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const menuItems = [
    {
      id: "expense",
      label: "Expense",
      icon: ArrowUpRight,
      color: "bg-expense hover:bg-expense/90 text-white border-expense/20",
      action: () => handleAction("expense"),
      x: -64,
      y: -64,
    },
    {
      id: "transfer",
      label: "Transfer",
      icon: ArrowLeftRight,
      color: "bg-transfer hover:bg-transfer/90 text-white border-transfer/20",
      action: () => handleAction("transfer"),
      x: 0,
      y: -96,
    },
    {
      id: "income",
      label: "Income",
      icon: ArrowDownLeft,
      color: "bg-income hover:bg-income/90 text-white border-income/20",
      action: () => handleAction("income"),
      x: 64,
      y: -64,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
      {/* Dark Overlay Backdrop behind expanded options */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleMenu}
            className="fixed inset-0 bg-background/60 backdrop-blur-xs z-40 transition-colors"
            style={{ width: "100vw", height: "100vh", left: "-50vw", top: "-100vh" }}
          />
        )}
      </AnimatePresence>

      {/* Radial Actions */}
      <div className="relative w-14 h-14 z-50">
        <AnimatePresence>
          {isOpen &&
            menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id}>
                  {/* Floating Action Circle */}
                  <motion.button
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{ scale: 1, x: item.x, y: item.y }}
                    exit={{ scale: 0, x: 0, y: 0 }}
                    transition={{ type: "spring", stiffness: 450, damping: 26 }}
                    onClick={item.action}
                    className={cn(
                      "absolute top-0 left-0 w-14 h-14 rounded-full flex items-center justify-center border shadow-premium-lg cursor-pointer touch-target",
                      item.color
                    )}
                    aria-label={`Add ${item.label}`}
                  >
                    <Icon className="h-5.5 w-5.5" />
                  </motion.button>

                  {/* Floating Action Text Label */}
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: item.y + 40, x: item.x }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-1/2 -translate-x-1/2 text-[10px] font-semibold text-foreground bg-card px-2 py-0.5 rounded-full border border-border/40 shadow-premium-sm pointer-events-none select-none"
                  >
                    {item.label}
                  </motion.span>
                </div>
              );
            })}
        </AnimatePresence>

        {/* Master FAB Trigger Button */}
        <motion.button
          onClick={toggleMenu}
          whileTap={{ scale: 0.94 }}
          className={cn(
            "w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-premium-lg cursor-pointer z-50 touch-target focus:outline-none transition-colors border border-border/20",
            isOpen && "bg-secondary text-foreground"
          )}
          aria-label="Toggle Quick Add Menu"
        >
          <motion.div
            animate={{ rotate: isOpen ? 135 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="flex items-center justify-center"
          >
            <Plus className="h-6 w-6" />
          </motion.div>
        </motion.button>
      </div>
    </div>
  );
};
export default FAB;
