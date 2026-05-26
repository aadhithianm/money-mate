import React, { useMemo } from "react";
import { useAccounts } from "@/hooks/useTransactions";
import { renderCategoryIcon } from "@/utils/icons";
import { ArrowLeft, Landmark, Wallet } from "lucide-react";
import { cn } from "@/utils/styles";
import type { Account } from "@/types/entities";

interface AccountPickerProps {
  selectedId?: string;
  onSelect: (account: Account) => void;
  onBack: () => void;
  excludeId?: string; // Prevent selecting same account as source in transfers
}

export const AccountPicker: React.FC<AccountPickerProps> = ({
  selectedId,
  onSelect,
  onBack,
  excludeId,
}) => {
  const { data: accounts = [], isLoading } = useAccounts();

  // 1. Filter out the excluded account
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => !acc.deleted_at && acc.id !== excludeId);
  }, [accounts, excludeId]);

  // 2. Format balance helper
  const formatBalance = (amount: number, currency: string) => {
    const value = amount / 100;
    // Format according to BCP 47
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(value);
  };

  // Helper to map account type to visual icons
  const getAccountIcon = (type: string) => {
    switch (type) {
      case "checking":
        return "Landmark";
      case "savings":
        return "PiggyBank";
      case "credit":
        return "CreditCard";
      case "cash":
        return "CircleDollarSign";
      default:
        return "Wallet";
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header Row */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onBack}
          className="p-1 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer touch-target flex items-center justify-center"
          aria-label="Go back to form"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Select Account
        </span>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="h-5 w-5 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pb-6">
          {filteredAccounts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xs text-muted-foreground">No accounts found.</p>
            </div>
          ) : (
            filteredAccounts.map((acc) => {
              const isSelected = selectedId === acc.id;
              const isCredit = acc.type === "credit";
              const isNegative = acc.balance < 0;

              return (
                <button
                  key={acc.id}
                  onClick={() => onSelect(acc)}
                  className={cn(
                    "w-full flex items-center justify-between p-3.5 border rounded-xl text-left cursor-pointer transition-all active:scale-[0.98]",
                    isSelected
                      ? "bg-primary/5 border-primary shadow-premium-sm"
                      : "border-border/40 bg-card hover:bg-secondary/40 text-foreground"
                  )}
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center border",
                        isSelected
                          ? "bg-primary/10 border-primary/20 text-primary animate-pulse"
                          : "bg-secondary/25 border-border/20 text-muted-foreground"
                      )}
                    >
                      {renderCategoryIcon(getAccountIcon(acc.type), "h-5 w-5")}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate leading-tight">
                        {acc.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mt-0.5 leading-none">
                        {acc.type}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span
                      className={cn(
                        "text-xs font-bold font-mono tracking-tight",
                        isCredit
                          ? isNegative
                            ? "text-income"
                            : "text-expense"
                          : isNegative
                          ? "text-expense"
                          : "text-foreground"
                      )}
                    >
                      {formatBalance(acc.balance, acc.currency)}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
export default AccountPicker;
