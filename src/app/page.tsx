"use client";

import React, { useState } from "react";
import { useUIStore } from "@/stores/uiStore";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { ListItem } from "@/shared/ui/ListItem";
import { Tabs } from "@/shared/ui/Tabs";
import { Chip } from "@/shared/ui/Chip";
import { Avatar } from "@/shared/ui/Avatar";
import { Input } from "@/shared/ui/Input";
import { SearchInput } from "@/shared/ui/SearchInput";
import { SectionTitle } from "@/shared/typography/SectionTitle";
import { EmptyState } from "@/shared/feedback/EmptyState";
import { LoadingSkeletonList } from "@/shared/feedback/LoadingSkeleton";
import { Modal } from "@/shared/feedback/Modal";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  Info, 
  ChevronRight, 
  Play, 
  Sparkles 
} from "lucide-react";

export default function LedgerPage() {
  const { addToast } = useUIStore();
  const [activeTab, setActiveTab] = useState("feed");
  const [searchValue, setSearchValue] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // Quick stats metrics
  const stats = [
    { label: "Net Ledger", value: "$4,280.50", icon: Wallet, color: "text-foreground" },
    { label: "This Month Income", value: "+$5,400.00", icon: ArrowDownLeft, color: "text-income" },
    { label: "This Month Spent", value: "-$1,119.50", icon: ArrowUpRight, color: "text-expense" },
  ];

  // Ledger Feed Items
  const ledgerItems = [
    {
      date: "Today, May 26",
      items: [
        { title: "Salary Deposit", category: "Income", amount: "+$2,800.00", type: "income", description: "Monthly freelance deposit", time: "10:30 AM" },
        { title: "Whole Foods Market", category: "Food & Groceries", amount: "-$124.20", type: "expense", description: "Weekly grocery restock", time: "02:15 PM" },
        { title: "Transfer to Savings", category: "Transfer", amount: "-$500.00", type: "transfer", description: "Vault sweeping deposit", time: "05:40 PM" },
      ],
    },
    {
      date: "Yesterday, May 25",
      items: [
        { title: "Peet's Coffee & Tea", category: "Leisure & Cafes", amount: "-$6.80", type: "expense", description: "Morning caffeine run", time: "08:15 AM" },
        { title: "Chevron Gas Station", category: "Transport", amount: "-$45.00", type: "expense", description: "Fuel refilling", time: "11:20 AM" },
      ],
    },
  ];

  return (
    <div className="space-y-6 select-none max-w-xl mx-auto">
      {/* 3-Column Mini Dashboard summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-3.5 flex flex-col justify-between border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </span>
                <Icon className={`h-3.5 w-3.5 ${stat.color} opacity-75`} />
              </div>
              <span className={`text-sm md:text-base font-bold font-mono tracking-tight mt-2.5 ${stat.color}`}>
                {stat.value}
              </span>
            </Card>
          );
        })}
      </div>

      {/* Tabs Menu */}
      <Tabs
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId)}
        tabs={[
          { id: "feed", label: "Ledger Feed" },
          { id: "showcase", label: "Component Lab" },
          { id: "loader-empty", label: "Empty & Loading" },
        ]}
      />

      {/* Ledger Feed View */}
      {activeTab === "feed" && (
        <div className="space-y-5">
          {/* Header row with search */}
          <div className="flex items-center space-x-2 px-1">
            <SearchInput
              placeholder="Search ledger entries..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onClear={() => setSearchValue("")}
              className="text-xs"
            />
          </div>

          {/* Grouped feed lines */}
          <div className="space-y-5">
            {ledgerItems.map((group) => (
              <div key={group.date} className="space-y-2">
                <SectionTitle>{group.date}</SectionTitle>
                <div className="bg-card border border-border/40 rounded-lg overflow-hidden shadow-premium-sm">
                  {group.items
                    .filter((item) =>
                      item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
                      item.category.toLowerCase().includes(searchValue.toLowerCase())
                    )
                    .map((item, idx, arr) => {
                      const isExpense = item.type === "expense";
                      const isIncome = item.type === "income";
                      
                      return (
                        <ListItem
                          key={idx}
                          title={item.title}
                          subtitle={`${item.category} • ${item.time}`}
                          divider={idx !== arr.length - 1}
                          interactive
                          prefix={
                            <div
                              className={`h-9 w-9 rounded-full flex items-center justify-center border ${
                                isIncome
                                  ? "bg-income/10 border-income/20 text-income"
                                  : isExpense
                                  ? "bg-expense/10 border-expense/20 text-expense"
                                  : "bg-transfer/10 border-transfer/20 text-transfer"
                              }`}
                            >
                              <span className="text-xs font-bold font-mono">
                                {isIncome ? "+" : isExpense ? "-" : "→"}
                              </span>
                            </div>
                          }
                          suffix={
                            <span
                              className={`font-mono font-bold text-xs tracking-tight ${
                                isIncome
                                  ? "text-income"
                                  : isExpense
                                  ? "text-expense"
                                  : "text-transfer"
                              }`}
                            >
                              {item.amount}
                            </span>
                          }
                        />
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
          
          <div className="px-1 text-center">
            <p className="text-[10px] text-muted-foreground/75 uppercase tracking-wider font-bold">
              💡 Tip: Click the center FAB below to add transactions!
            </p>
          </div>
        </div>
      )}

      {/* Component Showcase view */}
      {activeTab === "showcase" && (
        <div className="space-y-6 bg-card p-5 border border-border/40 rounded-lg shadow-premium-sm">
          {/* Typography Scale */}
          <div className="space-y-2">
            <SectionTitle className="px-0">Typography Scales</SectionTitle>
            <div className="space-y-1 bg-secondary/25 p-3 rounded-md border border-border/30">
              <p className="text-xxxl font-bold tracking-tight">Amount: $5,240.00</p>
              <p className="text-xl font-bold">Feed Header Title</p>
              <p className="text-base font-semibold">Subheader Form Header</p>
              <p className="text-sm font-medium">Standard Body & Description Text</p>
              <p className="text-xs text-muted-foreground">Caption & Transaction Timestamps</p>
            </div>
          </div>

          {/* Core Buttons */}
          <div className="space-y-2">
            <SectionTitle className="px-0">Tactile Click Primitives</SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => addToast("Primary Button Tapped", "info")}>
                Primary Solid
              </Button>
              <Button variant="secondary" onClick={() => addToast("Secondary Button Tapped", "info")}>
                Secondary Grey
              </Button>
              <Button variant="outline" onClick={() => addToast("Outline Button Tapped", "info")}>
                Outline Frame
              </Button>
              <Button variant="ghost" onClick={() => addToast("Ghost Button Tapped", "info")}>
                Ghost Row
              </Button>
              <Button variant="income" onClick={() => addToast("Income Quick Entry Tapped", "success")}>
                Income Green
              </Button>
              <Button variant="expense" onClick={() => addToast("Expense Quick Entry Tapped", "error")}>
                Expense Rose
              </Button>
              <Button variant="transfer" onClick={() => addToast("Transfer Quick Entry Tapped", "info")}>
                Transfer Blue
              </Button>
              <Button loading>Loading Spindle</Button>
            </div>
          </div>

          {/* Dialog Modal trigger */}
          <div className="space-y-2">
            <SectionTitle className="px-0">Dialog Modals</SectionTitle>
            <Button variant="outline" fullWidth onClick={() => setModalOpen(true)}>
              Launch Responsive Modal
            </Button>
          </div>

          {/* Chips & Badges */}
          <div className="space-y-2">
            <SectionTitle className="px-0">Category Chips & Badges</SectionTitle>
            <div className="flex flex-wrap gap-2.5 items-center bg-secondary/15 p-3 rounded-md border border-border/30">
              <Chip variant="default">Default Tag</Chip>
              <Chip variant="income">Income Active</Chip>
              <Chip variant="expense">Expense Alert</Chip>
              <Chip variant="transfer">Transfer Pending</Chip>
              <Chip variant="outline">Empty State</Chip>
            </div>
          </div>

          {/* Avatars */}
          <div className="space-y-2">
            <SectionTitle className="px-0">Avatars Fallbacks</SectionTitle>
            <div className="flex items-center space-x-3 bg-secondary/15 p-3 rounded-md border border-border/30">
              <Avatar size="sm" fallback="Aadhi K." />
              <Avatar size="md" fallback="Money Mate" />
              <Avatar size="lg" fallback="Super Admin" />
              <span className="text-xs text-muted-foreground">Auto-generates letters initials!</span>
            </div>
          </div>

          {/* Alert Toasts triggers */}
          <div className="space-y-2">
            <SectionTitle className="px-0">Alert Toasts Triggers</SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => addToast("Action successful!", "success")}>
                Success Alert
              </Button>
              <Button variant="outline" onClick={() => addToast("Transaction failed!", "error")}>
                Error Alert
              </Button>
              <Button variant="outline" onClick={() => addToast("Sweeping local state...", "info")}>
                Info Alert
              </Button>
              <Button variant="outline" onClick={() => addToast("Syncing in background...", "warning")}>
                Warning Alert
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loaders and Empty State View */}
      {activeTab === "loader-empty" && (
        <div className="space-y-6">
          {/* Loading Skeleton */}
          <div className="space-y-2 bg-card p-4 border border-border/40 rounded-lg shadow-premium-sm">
            <SectionTitle className="px-1 flex items-center justify-between">
              <span>Shimmer Loader Skeletons</span>
              <span className="text-[8px] font-bold text-muted-foreground animate-pulse">ACTIVE SHIMMER</span>
            </SectionTitle>
            <LoadingSkeletonList />
          </div>

          {/* Empty State placeholder */}
          <div className="bg-card p-4 border border-border/40 rounded-lg shadow-premium-sm">
            <SectionTitle className="px-1 mb-3">Empty State Graphic</SectionTitle>
            <EmptyState
              title="No Filter Matches"
              description="No transaction ledger found. Try altering your ledger query or clearing filters."
              action={
                <Button size="sm" variant="secondary" onClick={() => setSearchValue("")}>
                  Clear Query
                </Button>
              }
            />
          </div>
        </div>
      )}

      {/* Global Showcase Dialog Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Foundational Infrastructure OK">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-income bg-income/10 p-3 rounded-lg border border-income/20">
            <Sparkles className="h-5 w-5 flex-shrink-0" />
            <p className="text-xs font-semibold">
              Money Mate Phase 1 foundational layout, design system tokens, gestures, and responsive infrastructure is fully active.
            </p>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            No business logic or backend features are bound. Everything you see is powered strictly by local store states, making this fully ready for Supabase or Dexie sync attachments.
          </p>
          <div className="flex items-center space-x-2 pt-2">
            <Button size="sm" className="font-semibold text-xs" onClick={() => setModalOpen(false)}>
              Acknowledge
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
