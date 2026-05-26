import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDeleteTransaction } from "@/hooks/useTransactions";
import { renderCategoryIcon } from "@/utils/icons";
import { useUIStore } from "@/stores/uiStore";
import { 
  Edit2, 
  Trash2, 
  ChevronDown, 
  Calendar, 
  Clock, 
  Landmark, 
  ArrowRightLeft, 
  FileText
} from "lucide-react";
import { cn } from "@/utils/styles";
import type { Transaction, Account, Category } from "@/types/entities";

interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  account?: Account;
  transferDestAccount?: Account;
  onEdit?: (transaction: Transaction) => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  category,
  account,
  transferDestAccount,
  onEdit,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [swipeRevealed, setSwipeRevealed] = useState(false);
  const deleteMutation = useDeleteTransaction();
  const { addToast } = useUIStore();

  // ── Helpers ────────────────────────────────────────────────────────────────

  const formatAmount = (amount: number, type: string) => {
    const value = amount / 100;
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: transaction.currency || "USD",
    }).format(value);

    if (type === "expense") return `-${formatted}`;
    if (type === "income") return `+${formatted}`;
    return formatted; // transfer
  };

  const getTransactionTime = (isoString: string) => {
    try {
      const dateObj = new Date(isoString);
      return dateObj.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "12:00 PM";
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await deleteMutation.mutateAsync(transaction.id);
        addToast("Transaction deleted successfully", "success");
      } catch {}
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(transaction);
  };

  // Drag Gesture Handlers
  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x < -45) {
      setSwipeRevealed(true);
    } else {
      setSwipeRevealed(false);
    }
  };

  const isExpense = transaction.type === "expense";
  const isIncome = transaction.type === "income";
  const isTransfer = transaction.type === "transfer";

  const amountColor = isIncome
    ? "text-income"
    : isExpense
    ? "text-expense"
    : "text-transfer";

  const categoryColor = category?.color || "#71717a";

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/30 bg-card/40 transition-colors select-none">
      
      {/* BACKGROUND ACTION ROW (revealed under swipe) */}
      <div className="absolute inset-y-0 right-0 w-[120px] flex items-center justify-end pr-2 bg-destructive/10 z-0">
        <div className="flex items-center space-x-1.5 h-full py-1">
          {/* Quick Edit */}
          <button
            onClick={handleEditClick}
            className="w-11 h-11 rounded-xl bg-secondary border border-border/40 hover:text-foreground text-muted-foreground flex items-center justify-center cursor-pointer transition-colors active:scale-95 touch-target"
            title="Edit"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          
          {/* Quick Delete */}
          <button
            onClick={handleDelete}
            className="w-11 h-11 rounded-xl bg-expense/10 border border-expense/20 text-expense hover:bg-expense/20 flex items-center justify-center cursor-pointer transition-colors active:scale-95 touch-target"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* FOREGROUND CAROUSEL CARD (swipeable, draggable container) */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -120, right: 0 }}
        dragElastic={0.06}
        dragTransition={{ bounceStiffness: 500, bounceDamping: 26 }}
        onDragEnd={handleDragEnd}
        animate={{ x: swipeRevealed ? -120 : 0 }}
        onClick={() => {
          if (swipeRevealed) {
            setSwipeRevealed(false);
          } else {
            setIsExpanded(!isExpanded);
          }
        }}
        className={cn(
          "relative z-10 w-full flex flex-col p-3.5 bg-card border-none rounded-xl cursor-pointer active:bg-secondary/15 transition-colors"
        )}
      >
        {/* Row View */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3 min-w-0">
            {/* Visual Icon Badge */}
            <div
              className="h-9 w-9 rounded-full flex items-center justify-center text-white flex-shrink-0"
              style={{
                backgroundColor: isTransfer ? "var(--color-transfer)" : categoryColor,
              }}
            >
              {isTransfer ? (
                <ArrowRightLeft className="h-4 w-4" />
              ) : (
                renderCategoryIcon(category?.icon, "h-4.5 w-4.5")
              )}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold leading-tight truncate text-foreground">
                {isTransfer
                  ? `Transfer to ${transferDestAccount?.name || "Savings"}`
                  : transaction.description || category?.name || "Uncategorized"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">
                {isTransfer
                  ? `${account?.name || "Checking"}`
                  : `${category?.name || "Uncategorized"} • ${account?.name || "Checking"}`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 pl-2 flex-shrink-0">
            {/* Value Amount */}
            <span className={cn("text-xs font-bold font-mono tracking-tight", amountColor)}>
              {formatAmount(transaction.amount, transaction.type)}
            </span>
            
            {/* Expand caret */}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-muted-foreground/40 hover:text-muted-foreground"
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </div>
        </div>

        {/* Accordion Expanded Details View */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden pt-3.5 mt-3 border-t border-border/30"
              onClick={(e) => e.stopPropagation()} // Prevents clicks on detail items from collapsing the card
            >
              <div className="grid grid-cols-2 gap-3 text-[10px] pb-3 text-muted-foreground font-medium">
                {/* Account Details */}
                <div className="flex items-center space-x-2">
                  <Landmark className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">
                    {account?.name} ({account?.type})
                  </span>
                </div>

                {/* Transfer Destination details */}
                {isTransfer && transferDestAccount && (
                  <div className="flex items-center space-x-2">
                    <ArrowRightLeft className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">
                      Destination: {transferDestAccount.name}
                    </span>
                  </div>
                )}

                {/* Date Details */}
                <div className="flex items-center space-x-2">
                  <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>Date: {transaction.date}</span>
                </div>

                {/* Time Details */}
                <div className="flex items-center space-x-2">
                  <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>Time: {getTransactionTime(transaction.created_at)}</span>
                </div>
              </div>

              {/* Collapsed Optional Notes Block */}
              {transaction.notes && (
                <div className="bg-secondary/20 p-2.5 rounded-lg border border-border/20 text-xs text-muted-foreground mb-3 flex items-start space-x-2">
                  <FileText className="h-3.5 w-3.5 mt-0.5 text-muted-foreground/50 flex-shrink-0" />
                  <p className="leading-normal break-words whitespace-pre-wrap">{transaction.notes}</p>
                </div>
              )}

              {/* Clickable Action row in Accordion */}
              <div className="flex items-center justify-end space-x-2 pt-1">
                <button
                  onClick={handleEditClick}
                  className="flex items-center space-x-1.5 px-3 py-1.5 border border-border/40 hover:bg-secondary rounded-lg text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center space-x-1.5 px-3 py-1.5 border border-expense/20 bg-expense/5 hover:bg-expense/10 rounded-lg text-[10px] font-bold uppercase tracking-wider text-expense cursor-pointer transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Delete</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
export default TransactionItem;
