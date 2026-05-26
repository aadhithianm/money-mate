"use client";

import React, { useState } from "react";
import { Sidebar } from "@/shared/navigation/Sidebar";
import { BottomNav } from "@/shared/navigation/BottomNav";
import { Header } from "@/shared/layout/Header";
import { FAB } from "@/shared/ui/FAB";
import { BottomSheet } from "@/shared/sheets/BottomSheet";
import { useUIStore } from "@/stores/uiStore";
import { ToastProvider } from "@/shared/feedback/Toast";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { cn } from "@/utils/styles";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeSheet, closeSheet, addToast } = useUIStore();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  
  // Transfer account options
  const [fromAccount, setFromAccount] = useState("checking");
  const [toAccount, setToAccount] = useState("savings");

  const categories = {
    expense: ["Food", "Transport", "Shopping", "Rent", "Utilities", "Leisure"],
    income: ["Salary", "Freelance", "Investment", "Bonus", "Gift"],
  };

  const handleQuickAdd = (type: "expense" | "income" | "transfer") => {
    if (!amount) {
      addToast("Please enter an amount", "error");
      return;
    }
    
    addToast(
      `${type.charAt(0).toUpperCase() + type.slice(1)} of $${amount} added successfully!`,
      "success"
    );
    
    // Clear inputs and close
    setAmount("");
    setDescription("");
    setSelectedCategory("");
    closeSheet();
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
  };

  return (
    <div className="flex min-h-screen w-full bg-background transition-colors overflow-hidden">
      {/* Collapsible Sidebar (Desktop) */}
      <Sidebar />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto no-scrollbar relative pb-16 md:pb-0">
        {/* Sticky Mobile Header */}
        <Header title="Ledger Feed" />

        {/* Dynamic Page Content */}
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 md:py-8">
          {children}
        </main>

        {/* Toast Notification Manager */}
        <ToastProvider />

        {/* Centered Quick FAB (Mobile) */}
        <FAB />

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>

      {/* Global Bottom Sheet Drawer for Quick Action Entries */}
      <BottomSheet
        isOpen={activeSheet !== null}
        onClose={closeSheet}
        title={
          activeSheet === "expense"
            ? "New Expense"
            : activeSheet === "income"
            ? "New Income"
            : activeSheet === "transfer"
            ? "New Transfer"
            : undefined
        }
      >
        {activeSheet && activeSheet !== "transfer" && (
          <div className="space-y-5">
            {/* Amount Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Amount
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-lg font-bold text-muted-foreground">$</span>
                <Input
                  type="number"
                  pattern="[0-9]*"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8 text-xl font-bold font-mono tracking-tight"
                />
              </div>
            </div>

            {/* Category Grid Picker */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                {categories[activeSheet as "expense" | "income"].map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => handleCategorySelect(cat)}
                      className={cn(
                        "py-3 px-2 border rounded-lg text-xs font-semibold select-none cursor-pointer transition-all active:scale-95 text-center truncate",
                        isSelected
                          ? activeSheet === "expense"
                            ? "bg-expense/10 border-expense text-expense font-bold shadow-premium-sm"
                            : "bg-income/10 border-income text-income font-bold shadow-premium-sm"
                          : "border-border bg-card text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                      )}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes / Description */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Notes
              </label>
              <Input
                placeholder="What was this for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Quick Submit button */}
            <Button
              variant={activeSheet === "expense" ? "expense" : "income"}
              fullWidth
              size="lg"
              onClick={() => handleQuickAdd(activeSheet)}
              className="font-bold text-xs"
            >
              Add {activeSheet.charAt(0).toUpperCase() + activeSheet.slice(1)}
            </Button>
          </div>
        )}

        {activeSheet === "transfer" && (
          <div className="space-y-5">
            {/* Amount Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Amount
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-lg font-bold text-muted-foreground">$</span>
                <Input
                  type="number"
                  pattern="[0-9]*"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8 text-xl font-bold font-mono tracking-tight"
                />
              </div>
            </div>

            {/* From Account */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Source Account
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "checking", label: "Checking" },
                  { id: "cash", label: "Cash Wallet" },
                ].map((acc) => {
                  const isSelected = fromAccount === acc.id;
                  return (
                    <button
                      key={acc.id}
                      onClick={() => setFromAccount(acc.id)}
                      className={cn(
                        "py-3 px-2 border rounded-lg text-xs font-semibold text-center select-none cursor-pointer active:scale-95 transition-all",
                        isSelected
                          ? "bg-transfer/10 border-transfer text-transfer font-bold shadow-premium-sm"
                          : "border-border bg-card text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                      )}
                    >
                      {acc.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* To Account */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Destination Account
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "savings", label: "Savings" },
                  { id: "investments", label: "Investments" },
                ].map((acc) => {
                  const isSelected = toAccount === acc.id;
                  return (
                    <button
                      key={acc.id}
                      onClick={() => setToAccount(acc.id)}
                      className={cn(
                        "py-3 px-2 border rounded-lg text-xs font-semibold text-center select-none cursor-pointer active:scale-95 transition-all",
                        isSelected
                          ? "bg-transfer/10 border-transfer text-transfer font-bold shadow-premium-sm"
                          : "border-border bg-card text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                      )}
                    >
                      {acc.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Submit button */}
            <Button
              variant="transfer"
              fullWidth
              size="lg"
              onClick={() => handleQuickAdd("transfer")}
              className="font-bold text-xs"
            >
              Transfer Funds
            </Button>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};
export default AppShell;
