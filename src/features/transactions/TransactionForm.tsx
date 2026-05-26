import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useUIStore } from "@/stores/uiStore";
import { useAccounts, useCategories, useCreateTransaction, useUpdateTransaction } from "@/hooks/useTransactions";
import { CategoryPicker } from "./CategoryPicker";
import { AccountPicker } from "./AccountPicker";
import { renderCategoryIcon } from "@/utils/icons";
import { Input } from "@/shared/ui/Input";
import { Button } from "@/shared/ui/Button";
import { Calendar, ChevronRight, FileText, Landmark, Plus } from "lucide-react";
import { cn } from "@/utils/styles";
import type { Transaction, Account, Category } from "@/types/entities";
import type { UpdateTransactionInput } from "@/types/schemas";

interface TransactionFormProps {
  editTransaction?: Transaction; // Provided when in edit mode
  onSuccess?: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  editTransaction,
  onSuccess,
}) => {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const workspaceId = currentWorkspace?.id;
  const { addToast, activeSheet, closeSheet } = useUIStore();

  // Queries & Mutations
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  // State Management
  const [activePanel, setActivePanel] = useState<"form" | "category" | "account" | "transfer_dest">("form");
  const [type, setType] = useState<"expense" | "income" | "transfer">("expense");
  const [amountDigits, setAmountDigits] = useState("0"); // ATM style: digits string
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [transferDestAccount, setTransferDestAccount] = useState<Account | null>(null);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  // ── Pre-populate Form ──────────────────────────────────────────────────────

  // Effect to load initial state (from editTransaction or defaults)
  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type);
      setAmountDigits(editTransaction.amount.toString());
      setDate(editTransaction.date);
      setDescription(editTransaction.description || "");
      setNotes(editTransaction.notes || "");
      setShowDetails(!!editTransaction.description || !!editTransaction.notes);

      // Bind accounts & categories
      const acc = accounts.find((a) => a.id === editTransaction.account_id);
      if (acc) setSelectedAccount(acc);

      if (editTransaction.category_id) {
        const cat = categories.find((c) => c.id === editTransaction.category_id);
        if (cat) setSelectedCategory(cat);
      }

      if (editTransaction.transfer_account_id) {
        const dest = accounts.find((a) => a.id === editTransaction.transfer_account_id);
        if (dest) setTransferDestAccount(dest);
      }
    } else {
      // Default creation state
      // Capture the FAB initial trigger type from activeSheet if it exists
      if (activeSheet === "expense" || activeSheet === "income" || activeSheet === "transfer") {
        setType(activeSheet);
      }
      
      // Auto-select default checking/savings or first account
      if (accounts.length > 0 && !selectedAccount) {
        const def = accounts.find((a) => a.is_default && !a.deleted_at) || accounts.find((a) => !a.deleted_at);
        if (def) setSelectedAccount(def);
      }
    }
  }, [editTransaction, accounts, categories, activeSheet]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-select default account when accounts list loads
  useEffect(() => {
    if (!editTransaction && accounts.length > 0 && !selectedAccount) {
      const def = accounts.find((a) => a.is_default && !a.deleted_at) || accounts.find((a) => !a.deleted_at);
      if (def) setSelectedAccount(def);
    }
  }, [accounts, selectedAccount, editTransaction]);

  // Adjust pre-selected category when type changes
  useEffect(() => {
    if (!editTransaction && selectedCategory && selectedCategory.type !== type && type !== "transfer") {
      setSelectedCategory(null);
    }
  }, [type, selectedCategory, editTransaction]);

  // ── Currency / ATM Display Helpers ─────────────────────────────────────────

  const currencySymbol = useMemo(() => {
    const currency = currentWorkspace?.currency || "USD";
    try {
      return (0)
        .toLocaleString("en-US", { style: "currency", currency, minimumFractionDigits: 0 })
        .replace(/\d/g, "")
        .trim();
    } catch {
      return "$";
    }
  }, [currentWorkspace]);

  const formattedAmount = useMemo(() => {
    const cents = parseInt(amountDigits || "0", 10);
    const value = cents / 100;
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }, [amountDigits]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const digits = val.replace(/\D/g, "");
    const trimmed = digits.replace(/^0+/, "") || "0";
    setAmountDigits(trimmed);
  };

  // ── Save/Submit Form ───────────────────────────────────────────────────────

  const handleSave = async () => {
    const amountCents = parseInt(amountDigits, 10);
    if (amountCents <= 0) {
      addToast("Please enter a valid amount", "error");
      return;
    }

    if (!selectedAccount) {
      addToast("Please select an account", "error");
      return;
    }

    if (type !== "transfer" && !selectedCategory) {
      addToast("Please select a category", "error");
      return;
    }

    if (type === "transfer" && !transferDestAccount) {
      addToast("Please select a destination account", "error");
      return;
    }

    if (!workspaceId) return;

    try {
      if (editTransaction) {
        // Edit Mode
        const updateInput: UpdateTransactionInput = {
          id: editTransaction.id,
          account_id: selectedAccount.id,
          category_id: type !== "transfer" ? selectedCategory?.id : undefined,
          type,
          amount: amountCents,
          currency: currentWorkspace.currency,
          description: description.trim() || undefined,
          notes: notes.trim() || undefined,
          date,
          transfer_account_id: type === "transfer" ? transferDestAccount?.id : undefined,
        };
        await updateMutation.mutateAsync(updateInput);
        addToast("Transaction updated successfully", "success");
      } else {
        // Create Mode
        const createInput = {
          workspace_id: workspaceId,
          account_id: selectedAccount.id,
          category_id: type !== "transfer" ? selectedCategory?.id : undefined,
          type,
          amount: amountCents,
          currency: currentWorkspace.currency,
          description: description.trim() || undefined,
          notes: notes.trim() || undefined,
          date,
          transfer_account_id: type === "transfer" ? transferDestAccount?.id : undefined,
        };
        await createMutation.mutateAsync(createInput);
        addToast("Transaction added successfully", "success");
      }

      // Close Sheet or callback
      if (onSuccess) onSuccess();
      closeSheet();
    } catch {
      // Errors are handled inside mutations with Toast alerts
    }
  };

  // Dynamic Button & Input styling based on tab selection
  const activeColorClass =
    type === "expense"
      ? "bg-expense hover:bg-expense/90 text-white"
      : type === "income"
      ? "bg-income hover:bg-income/90 text-white"
      : "bg-transfer hover:bg-transfer/90 text-white";

  const activeFocusClass =
    type === "expense"
      ? "focus-within:border-expense/50"
      : type === "income"
      ? "focus-within:border-income/50"
      : "focus-within:border-transfer/50";

  return (
    <div className="h-full flex flex-col justify-between">
      <AnimatePresence mode="wait">
        {/* PANEL 1: Standard Transaction Form */}
        {activePanel === "form" && (
          <motion.div
            key="form"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -30, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="flex-1 flex flex-col justify-between space-y-5"
          >
            <div className="space-y-5 flex-1">
              {/* Segmented Selection Tabs */}
              {!editTransaction && (
                <div className="grid grid-cols-3 p-1 bg-secondary/35 rounded-xl border border-border/30">
                  {(["expense", "income", "transfer"] as const).map((tab) => {
                    const isActive = type === tab;
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setType(tab)}
                        className={cn(
                          "py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer select-none",
                          isActive
                            ? tab === "expense"
                              ? "bg-expense/10 text-expense shadow-premium-sm"
                              : tab === "income"
                              ? "bg-income/10 text-income shadow-premium-sm"
                              : "bg-transfer/10 text-transfer shadow-premium-sm"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Amount-First ATM Input Block */}
              <div className="space-y-1.5 text-center">
                <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/75 block">
                  Amount
                </label>
                <div className="relative inline-flex items-center justify-center max-w-full">
                  {/* Currency Symbol Prefix */}
                  <span className="text-xl md:text-2xl font-extrabold text-muted-foreground mr-1">
                    {currencySymbol}
                  </span>
                  
                  {/* Beautiful Digit Display overlay */}
                  <span
                    className={cn(
                      "text-3xl md:text-4xl font-black font-mono tracking-tight cursor-text",
                      parseInt(amountDigits, 10) > 0 ? "text-foreground" : "text-muted-foreground/35"
                    )}
                  >
                    {formattedAmount}
                  </span>

                  {/* Hidden underlying capture input for dynamic keypad action */}
                  <input
                    type="text"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    value={amountDigits === "0" ? "" : amountDigits}
                    onChange={handleAmountChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-text select-all"
                    autoFocus={!editTransaction}
                  />
                </div>
              </div>

              {/* Progressive Field Picker Rows */}
              <div className="space-y-2.5 pt-2">
                {/* Account Selection Row */}
                <button
                  type="button"
                  onClick={() => setActivePanel("account")}
                  className={cn(
                    "w-full flex items-center justify-between p-3 border border-border/40 rounded-xl bg-card transition-all active:scale-[0.99] select-none text-left cursor-pointer",
                    activeFocusClass
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-secondary/35 border border-border/20 flex items-center justify-center text-muted-foreground">
                      <Landmark className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                        {type === "transfer" ? "From Account" : "Account"}
                      </p>
                      <p className="text-xs font-semibold">
                        {selectedAccount ? selectedAccount.name : "Select Account"}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                </button>

                {/* Transfer Destination Account Selection Row */}
                {type === "transfer" && (
                  <button
                    type="button"
                    onClick={() => setActivePanel("transfer_dest")}
                    className={cn(
                      "w-full flex items-center justify-between p-3 border border-border/40 rounded-xl bg-card transition-all active:scale-[0.99] select-none text-left cursor-pointer",
                      activeFocusClass
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-secondary/35 border border-border/20 flex items-center justify-center text-muted-foreground">
                        <Landmark className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                          To Account
                        </p>
                        <p className="text-xs font-semibold">
                          {transferDestAccount ? transferDestAccount.name : "Select Destination"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                  </button>
                )}

                {/* Category Selection Row */}
                {type !== "transfer" && (
                  <button
                    type="button"
                    onClick={() => setActivePanel("category")}
                    className={cn(
                      "w-full flex items-center justify-between p-3 border border-border/40 rounded-xl bg-card transition-all active:scale-[0.99] select-none text-left cursor-pointer",
                      activeFocusClass
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center text-white"
                        style={{
                          backgroundColor: selectedCategory?.color || "var(--color-secondary)",
                        }}
                      >
                        {selectedCategory ? (
                          renderCategoryIcon(selectedCategory.icon, "h-4 w-4")
                        ) : (
                          <Plus className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                          Category
                        </p>
                        <p className="text-xs font-semibold">
                          {selectedCategory ? selectedCategory.name : "Select Category"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                  </button>
                )}

                {/* Date Picker Row (compact) */}
                <div className="flex items-center justify-between p-3 border border-border/40 rounded-xl bg-card">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-secondary/35 border border-border/20 flex items-center justify-center text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                        Date
                      </p>
                      <span className="text-xs font-semibold">
                        {date === new Date().toISOString().split("T")[0] ? "Today" : date}
                      </span>
                    </div>
                  </div>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-transparent text-xs font-semibold border-none focus:ring-0 cursor-pointer outline-none max-w-[120px] text-right text-muted-foreground hover:text-foreground transition-colors"
                  />
                </div>
              </div>

              {/* Progressive Disclosure: Details Drawer */}
              <div className="pt-2">
                {!showDetails ? (
                  <button
                    type="button"
                    onClick={() => setShowDetails(true)}
                    className="flex items-center space-x-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold px-1 py-1 cursor-pointer transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>+ Add Description & Notes</span>
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-2.5 overflow-hidden"
                  >
                    {/* Merchant / Payee input */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                        Merchant / Payee
                      </label>
                      <Input
                        placeholder="e.g. Whole Foods, Uber, Netflix"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                    
                    {/* Memo / Notes input */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                        Notes & Memo
                      </label>
                      <textarea
                        placeholder="Additional details..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full min-h-[60px] p-3 text-xs bg-secondary/15 hover:bg-secondary/25 border border-border/40 focus:border-primary/50 focus:bg-background rounded-xl transition-all outline-none resize-none"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Pinned Save Action */}
            <div className="pt-4 pb-2">
              <Button
                onClick={handleSave}
                loading={createMutation.isPending || updateMutation.isPending}
                className={cn("w-full py-4 text-xs font-bold uppercase tracking-wider shadow-premium-lg cursor-pointer rounded-xl", activeColorClass)}
              >
                {editTransaction ? "Update Transaction" : `Save ${type}`}
              </Button>
            </div>
          </motion.div>
        )}

        {/* PANEL 2: Category Picker Slide-in */}
        {activePanel === "category" && (
          <motion.div
            key="category"
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 30, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="flex-1"
          >
            <CategoryPicker
              type={type === "transfer" ? "expense" : type}
              selectedId={selectedCategory?.id}
              onBack={() => setActivePanel("form")}
              onSelect={(cat, subcategory) => {
                setSelectedCategory(cat);
                if (subcategory) {
                  setDescription(subcategory);
                  setShowDetails(true); // Open Progressive details to show auto-filled description
                }
                setActivePanel("form");
              }}
            />
          </motion.div>
        )}

        {/* PANEL 3: Account Picker Slide-in */}
        {activePanel === "account" && (
          <motion.div
            key="account"
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 30, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="flex-1"
          >
            <AccountPicker
              selectedId={selectedAccount?.id}
              onBack={() => setActivePanel("form")}
              onSelect={(acc) => {
                setSelectedAccount(acc);
                setActivePanel("form");
              }}
            />
          </motion.div>
        )}

        {/* PANEL 4: Destination Account Picker Slide-in */}
        {activePanel === "transfer_dest" && (
          <motion.div
            key="transfer_dest"
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 30, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="flex-1"
          >
            <AccountPicker
              selectedId={transferDestAccount?.id}
              excludeId={selectedAccount?.id}
              onBack={() => setActivePanel("form")}
              onSelect={(acc) => {
                setTransferDestAccount(acc);
                setActivePanel("form");
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default TransactionForm;
