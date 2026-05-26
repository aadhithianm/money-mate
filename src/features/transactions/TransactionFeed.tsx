import React, { useMemo } from "react";
import { useTransactions, useAccounts, useCategories } from "@/hooks/useTransactions";
import { useFilterStore } from "@/stores/filterStore";
import { TransactionItem } from "./TransactionItem";
import { LoadingSkeletonList } from "@/shared/feedback/LoadingSkeleton";
import { EmptyState } from "@/shared/feedback/EmptyState";
import { SectionTitle } from "@/shared/typography/SectionTitle";
import { useUIStore } from "@/stores/uiStore";
import type { Transaction } from "@/types/entities";

interface TransactionFeedProps {
  onEditTransaction?: (transaction: Transaction) => void;
}

export const TransactionFeed: React.FC<TransactionFeedProps> = ({
  onEditTransaction,
}) => {
  const filters = useFilterStore();
  const { data: transactions = [], isLoading } = useTransactions(filters);
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const { setSearch } = useFilterStore();

  // ── Date Grouping Logic ──────────────────────────────────────────────────

  const groupedTransactions = useMemo(() => {
    // 1. Sort transactions newest first (by date descending, then created_at descending)
    const sorted = [...transactions].sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.created_at.localeCompare(a.created_at);
    });

    // 2. Group by date string
    const groups: { [key: string]: Transaction[] } = {};
    sorted.forEach((tx) => {
      if (!groups[tx.date]) {
        groups[tx.date] = [];
      }
      groups[tx.date].push(tx);
    });

    return Object.entries(groups).map(([date, items]) => ({
      date,
      items,
    }));
  }, [transactions]);

  // Helper to format date headers elegantly
  const formatHeaderDate = (dateString: string) => {
    const today = new Date().toISOString().split("T")[0];
    
    // Yesterday calculation in user local time
    const yesterdayObj = new Date();
    yesterdayObj.setDate(yesterdayObj.getDate() - 1);
    const yesterday = yesterdayObj.toISOString().split("T")[0];

    if (dateString === today) return "Today";
    if (dateString === yesterday) return "Yesterday";

    try {
      // Append time to prevent timezone shift issues
      const dateObj = new Date(`${dateString}T00:00:00`);
      return dateObj.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // ── Render States ────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-4 py-2">
        <LoadingSkeletonList />
      </div>
    );
  }

  if (transactions.length === 0) {
    const hasActiveFilters =
      filters.accountId ||
      filters.categoryId ||
      filters.type ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.search;

    return (
      <div className="py-10 bg-card/10 border border-border/30 rounded-xl">
        <EmptyState
          title={hasActiveFilters ? "No Matches Found" : "No Transactions Yet"}
          description={
            hasActiveFilters
              ? "No ledger lines match your search criteria. Try modifying or clearing your filters."
              : "Your ledger is clean! Start logging transactions using the quick FAB below."
          }
          action={
            hasActiveFilters ? (
              <button
                onClick={() => {
                  filters.resetFilters();
                  setSearch("");
                }}
                className="px-3 py-1.5 bg-secondary text-foreground hover:bg-secondary/80 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Reset All Filters
              </button>
            ) : undefined
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {groupedTransactions.map((group) => (
        <div key={group.date} className="space-y-2.5 relative">
          
          {/* Sticky Scroll date header */}
          <div className="sticky top-14 md:top-0 bg-background/90 backdrop-blur-md z-20 py-2.5 px-1 border-b border-border/10 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {formatHeaderDate(group.date)}
            </span>
            <span className="text-[9px] font-semibold text-muted-foreground/50 font-mono">
              {group.items.length} {group.items.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          {/* Group Items list container */}
          <div className="space-y-2">
            {group.items.map((tx) => {
              const cat = categories.find((c) => c.id === tx.category_id);
              const acc = accounts.find((a) => a.id === tx.account_id);
              const dest = tx.transfer_account_id
                ? accounts.find((a) => a.id === tx.transfer_account_id)
                : undefined;

              return (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  category={cat}
                  account={acc}
                  transferDestAccount={dest}
                  onEdit={onEditTransaction}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
export default TransactionFeed;
