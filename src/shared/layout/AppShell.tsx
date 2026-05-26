"use client";

import React from "react";
import { Sidebar } from "@/shared/navigation/Sidebar";
import { BottomNav } from "@/shared/navigation/BottomNav";
import { Header } from "@/shared/layout/Header";
import { FAB } from "@/shared/ui/FAB";
import { BottomSheet } from "@/shared/sheets/BottomSheet";
import { useUIStore } from "@/stores/uiStore";
import { ToastProvider } from "@/shared/feedback/Toast";
import { TransactionForm } from "@/features/transactions/TransactionForm";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeSheet, closeSheet } = useUIStore();

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
        {activeSheet && (
          <TransactionForm onSuccess={closeSheet} />
        )}
      </BottomSheet>
    </div>
  );
};
export default AppShell;
