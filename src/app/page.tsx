"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useUIStore } from "@/stores/uiStore";
import { useFilterStore } from "@/stores/filterStore";
import { useAccounts, useCategories } from "@/hooks/useTransactions";
import { TransactionFeed } from "@/features/transactions/TransactionFeed";
import { TransactionForm } from "@/features/transactions/TransactionForm";
import { BottomSheet } from "@/shared/sheets/BottomSheet";
import { SearchInput } from "@/shared/ui/SearchInput";
import { Chip } from "@/shared/ui/Chip";
import { financialEventService } from "@/services/financialEventService";
import { 
  Wallet, 
  Filter, 
  RotateCcw,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft
} from "lucide-react";
import { cn } from "@/utils/styles";
import type { Transaction } from "@/types/entities";

export default function LedgerPage() {
  const { addToast } = useUIStore();
  const filters = useFilterStore();
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();

  // Active filters and query mutations from Zustand store
  const { 
    accountId, 
    categoryId, 
    type, 
    search, 
    setAccountId, 
    setCategoryId, 
    setType, 
    setSearch, 
    resetFilters 
  } = useFilterStore();

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // ── Financial Milestone & Event Toasts Listener ────────────────────────────

  useEffect(() => {
    const unsubscribe = financialEventService.subscribe((event) => {
      if (event.type === "low_balance") {
        addToast(event.message, "warning", 5000);
      } else if (event.type === "transaction_created") {
        addToast(event.message, "success", 3000);
      } else if (event.type === "transaction_updated") {
        addToast(event.message, "info", 3000);
      } else if (event.type === "transaction_deleted") {
        addToast(event.message, "warning", 3000);
      }
    });

    return () => unsubscribe();
  }, [addToast]);

  // ── Dynamic calculations ───────────────────────────────────────────────────

  // Sum balances of all non-deleted accounts for a compact Net Ledger overview
  const netLedgerBalance = useMemo(() => {
    return accounts.reduce((sum, acc) => {
      if (acc.deleted_at) return sum;
      return sum + acc.balance;
    }, 0);
  }, [accounts]);

  const formattedNetBalance = useMemo(() => {
    const val = netLedgerBalance / 100;
    const currency = accounts[0]?.currency || "USD";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(val);
  }, [netLedgerBalance, accounts]);

  return (
    <div className="space-y-5 select-none max-w-xl mx-auto">
      
      {/* ── Compact Net Ledger Header Banner ───────────────────────────────── */}
      <div className="flex items-center justify-between p-4 bg-card/60 backdrop-blur-md border border-border/30 rounded-xl shadow-premium-sm">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground block">
              Net Ledger Balance
            </span>
            <span className="text-lg font-black font-mono tracking-tight text-foreground leading-none mt-0.5 block">
              {formattedNetBalance}
            </span>
          </div>
        </div>
        
        {/* Sparkle decorative milestone check */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-secondary/35 border border-border/30 rounded-lg text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
          <Sparkles className="h-3 w-3 text-amber-400" />
          <span>Local Engine Active</span>
        </div>
      </div>

      {/* ── Active Search and Filtering Row ─────────────────────────────────── */}
      <div className="space-y-3 p-3.5 bg-card/45 border border-border/30 rounded-xl shadow-premium-sm">
        <div className="flex items-center space-x-2">
          {/* Main search bar */}
          <SearchInput
            placeholder="Search ledger entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
            className="text-xs bg-secondary/20 border-border/40 focus:border-primary/50 flex-1"
          />

          {/* Toggle filter drawers */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={cn(
              "p-2.5 border rounded-xl flex items-center justify-center cursor-pointer transition-colors active:scale-95 touch-target",
              showAdvancedFilters || accountId || categoryId
                ? "bg-primary/10 border-primary text-primary"
                : "border-border/40 bg-card hover:bg-secondary/40 text-muted-foreground"
            )}
            title="Toggle filters"
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>

        {/* Quick segmented transaction type tags */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {[
            { id: null, label: "All Feed", icon: null },
            { id: "expense", label: "Expense", icon: TrendingDown, color: "text-expense border-expense/20 bg-expense/5 hover:bg-expense/10" },
            { id: "income", label: "Income", icon: TrendingUp, color: "text-income border-income/20 bg-income/5 hover:bg-income/10" },
            { id: "transfer", label: "Transfer", icon: ArrowRightLeft, color: "text-transfer border-transfer/20 bg-transfer/5 hover:bg-transfer/10" }
          ].map((chip) => {
            const isActive = type === chip.id;
            const Icon = chip.icon;

            return (
              <button
                key={chip.label}
                onClick={() => setType(chip.id as any)}
                className={cn(
                  "py-1.5 px-3 border rounded-full text-[10px] font-bold uppercase tracking-wider select-none cursor-pointer transition-all active:scale-95 flex items-center space-x-1.5 leading-none",
                  isActive
                    ? chip.id === "expense"
                      ? "bg-expense border-expense text-white font-extrabold shadow-premium-sm"
                      : chip.id === "income"
                      ? "bg-income border-income text-white font-extrabold shadow-premium-sm"
                      : chip.id === "transfer"
                      ? "bg-transfer border-transfer text-white font-extrabold shadow-premium-sm"
                      : "bg-primary border-primary text-primary-foreground font-extrabold shadow-premium-sm"
                    : chip.color || "border-border/40 bg-card text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                )}
              >
                {Icon && <Icon className="h-3 w-3 flex-shrink-0" />}
                <span>{chip.label}</span>
              </button>
            );
          })}

          {/* Quick Clear filters reset */}
          {(accountId || categoryId || type || search) && (
            <button
              onClick={() => {
                resetFilters();
                setSearch("");
              }}
              className="ml-auto flex items-center space-x-1 px-2.5 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:bg-secondary/40 border border-border/20 rounded-md cursor-pointer transition-all active:scale-95 font-bold uppercase tracking-wider leading-none"
              title="Reset Filters"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Collapsible Advanced selector filters */}
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="grid grid-cols-2 gap-2 pt-2.5 border-t border-border/20"
          >
            {/* Account filter */}
            <div className="space-y-1">
              <label className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground px-0.5">
                Filter by Account
              </label>
              <select
                value={accountId || ""}
                onChange={(e) => setAccountId(e.target.value || null)}
                className="w-full p-2.5 text-xs bg-secondary/15 hover:bg-secondary/25 border border-border/40 focus:border-primary/50 rounded-xl transition-all outline-none"
              >
                <option value="">All Accounts</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category filter */}
            <div className="space-y-1">
              <label className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground px-0.5">
                Filter by Category
              </label>
              <select
                value={categoryId || ""}
                onChange={(e) => setCategoryId(e.target.value || null)}
                className="w-full p-2.5 text-xs bg-secondary/15 hover:bg-secondary/25 border border-border/40 focus:border-primary/50 rounded-xl transition-all outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.type})
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Dynamic Grouped Transaction Feed ─────────────────────────────────── */}
      <TransactionFeed onEditTransaction={(tx) => setEditingTransaction(tx)} />

      {/* ── Transaction Editor Dialog Drawer Bottom Sheet ────────────────────── */}
      <BottomSheet
        isOpen={editingTransaction !== null}
        onClose={() => setEditingTransaction(null)}
        title="Edit Transaction"
      >
        {editingTransaction && (
          <TransactionForm
            editTransaction={editingTransaction}
            onSuccess={() => setEditingTransaction(null)}
          />
        )}
      </BottomSheet>
      
    </div>
  );
}
