import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionService } from "@/services/transactionService";
import { transactionRepository } from "@/repositories/TransactionRepository";
import { accountRepository } from "@/repositories/AccountRepository";
import { categoryRepository } from "@/repositories/CategoryRepository";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useUIStore } from "@/stores/uiStore";
import type { TransactionFilters } from "@/stores/filterStore";
import type { Transaction, Account, Category } from "@/types/entities";
import type { CreateTransactionInput, UpdateTransactionInput } from "@/types/schemas";

// ─── Query Hook: Get Grouped and Filtered Transactions ─────────────────────

export function useTransactions(filters: TransactionFilters) {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const workspaceId = currentWorkspace?.id;

  return useQuery({
    queryKey: ["transactions", workspaceId, filters],
    queryFn: async () => {
      if (!workspaceId) return [] as Transaction[];

      const mappedFilter = {
        workspace_id: workspaceId,
        account_id: filters.accountId || undefined,
        category_id: filters.categoryId || undefined,
        type: filters.type || undefined,
        date_from: filters.dateFrom || undefined,
        date_to: filters.dateTo || undefined,
        search: filters.search || undefined,
      };

      // Performance Optimization: If no active filters, load recent transactions
      const hasActiveFilters =
        filters.accountId ||
        filters.categoryId ||
        filters.type ||
        filters.dateFrom ||
        filters.dateTo ||
        filters.search;

      if (!hasActiveFilters) {
        return await transactionRepository.listRecent(workspaceId, 100);
      }

      return await transactionRepository.listByFilter(mappedFilter);
    },
    enabled: !!workspaceId,
  });
}

// ─── Query Hook: Get Accounts ─────────────────────────────────────────────

export function useAccounts() {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const workspaceId = currentWorkspace?.id;

  return useQuery({
    queryKey: ["accounts", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [] as Account[];
      return await accountRepository.findAll(workspaceId);
    },
    enabled: !!workspaceId,
  });
}

// ─── Query Hook: Get Categories ───────────────────────────────────────────

export function useCategories() {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const workspaceId = currentWorkspace?.id;

  return useQuery({
    queryKey: ["categories", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [] as Category[];
      return await categoryRepository.findAll(workspaceId);
    },
    enabled: !!workspaceId,
  });
}

// ─── Mutation Hook: Create Transaction ─────────────────────────────────────

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const workspaceId = currentWorkspace?.id;
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: async (input: CreateTransactionInput) => {
      return await transactionService.createTransaction(input);
    },
    onMutate: async (newTransaction) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ["transactions", workspaceId] });
      await queryClient.cancelQueries({ queryKey: ["accounts", workspaceId] });

      // Snapshot previous states
      const previousQueries = queryClient.getQueriesData<Transaction[]>({
        queryKey: ["transactions", workspaceId],
      });
      const previousAccounts = queryClient.getQueryData<Account[]>(["accounts", workspaceId]);

      // Construct optimistic transaction
      const optimisticTx: Transaction = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...newTransaction,
      };

      // 1. Optimistically update transactions lists
      queryClient.setQueriesData<Transaction[]>(
        { queryKey: ["transactions", workspaceId] },
        (old) => {
          if (!old) return [optimisticTx];
          // Put the newest transaction first (assuming it is current date)
          return [optimisticTx, ...old];
        }
      );

      // 2. Optimistically update account balance card states
      queryClient.setQueryData<Account[]>(["accounts", workspaceId], (old) => {
        if (!old) return old;
        return old.map((acc) => {
          if (acc.id === newTransaction.account_id) {
            let delta = 0;
            if (newTransaction.type === "expense") delta = -newTransaction.amount;
            else if (newTransaction.type === "income") delta = newTransaction.amount;
            else if (newTransaction.type === "transfer") delta = -newTransaction.amount;

            return { ...acc, balance: acc.balance + delta };
          }

          if (
            newTransaction.type === "transfer" &&
            newTransaction.transfer_account_id &&
            acc.id === newTransaction.transfer_account_id
          ) {
            return { ...acc, balance: acc.balance + newTransaction.amount };
          }

          return acc;
        });
      });

      return { previousQueries, previousAccounts };
    },
    onError: (err: any, newTransaction, context) => {
      // Rollback
      if (context?.previousQueries) {
        context.previousQueries.forEach(([key, value]) => {
          queryClient.setQueryData(key, value);
        });
      }
      if (context?.previousAccounts) {
        queryClient.setQueryData(["accounts", workspaceId], context.previousAccounts);
      }
      addToast(err?.message || "Failed to create transaction", "error");
    },
    onSuccess: (data) => {
      // Track recency of categories and accounts
      if (data.category_id) {
        try {
          const key = `money-mate-recent-categories-${workspaceId}`;
          const recents = JSON.parse(localStorage.getItem(key) || "[]") as string[];
          const next = [data.category_id, ...recents.filter((id) => id !== data.category_id)].slice(0, 5);
          localStorage.setItem(key, JSON.stringify(next));
        } catch {}
      }
      try {
        const key = `money-mate-recent-accounts-${workspaceId}`;
        const recents = JSON.parse(localStorage.getItem(key) || "[]") as string[];
        const accounts = [data.account_id];
        if (data.transfer_account_id) accounts.push(data.transfer_account_id);
        
        let next = [...recents];
        accounts.forEach((accId) => {
          next = [accId, ...next.filter((id) => id !== accId)];
        });
        localStorage.setItem(key, JSON.stringify(next.slice(0, 5)));
      } catch {}
    },
    onSettled: () => {
      // Refresh to authoritative local data
      queryClient.invalidateQueries({ queryKey: ["transactions", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["accounts", workspaceId] });
    },
  });
}

// ─── Mutation Hook: Update Transaction ─────────────────────────────────────

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const workspaceId = currentWorkspace?.id;
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: async (input: UpdateTransactionInput) => {
      return await transactionService.updateTransaction(input);
    },
    onMutate: async (updatedInput) => {
      await queryClient.cancelQueries({ queryKey: ["transactions", workspaceId] });
      await queryClient.cancelQueries({ queryKey: ["accounts", workspaceId] });

      const previousQueries = queryClient.getQueriesData<Transaction[]>({
        queryKey: ["transactions", workspaceId],
      });
      const previousAccounts = queryClient.getQueryData<Account[]>(["accounts", workspaceId]);

      // Optimistically update lists
      queryClient.setQueriesData<Transaction[]>(
        { queryKey: ["transactions", workspaceId] },
        (old) => {
          if (!old) return old;
          return old.map((tx) => (tx.id === updatedInput.id ? { ...tx, ...updatedInput } as Transaction : tx));
        }
      );

      // (Note: Since reverting old balances and applying new ones requires comparing the previous amount/type
      // which we don't have easily in the input without a cache lookup, we invalidate on settled.
      // But we can still do a lightweight balance check if we wanted. Invalidating immediately brings local DB correctness).
      
      return { previousQueries, previousAccounts };
    },
    onError: (err: any, updatedInput, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([key, value]) => {
          queryClient.setQueryData(key, value);
        });
      }
      if (context?.previousAccounts) {
        queryClient.setQueryData(["accounts", workspaceId], context.previousAccounts);
      }
      addToast(err?.message || "Failed to update transaction", "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["accounts", workspaceId] });
    },
  });
}

// ─── Mutation Hook: Delete Transaction ─────────────────────────────────────

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const workspaceId = currentWorkspace?.id;
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: async (id: string) => {
      return await transactionService.deleteTransaction(id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["transactions", workspaceId] });
      await queryClient.cancelQueries({ queryKey: ["accounts", workspaceId] });

      const previousQueries = queryClient.getQueriesData<Transaction[]>({
        queryKey: ["transactions", workspaceId],
      });
      const previousAccounts = queryClient.getQueryData<Account[]>(["accounts", workspaceId]);

      // Optimistically delete from listings
      queryClient.setQueriesData<Transaction[]>(
        { queryKey: ["transactions", workspaceId] },
        (old) => {
          if (!old) return old;
          return old.filter((tx) => tx.id !== id);
        }
      );

      return { previousQueries, previousAccounts };
    },
    onError: (err: any, id, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([key, value]) => {
          queryClient.setQueryData(key, value);
        });
      }
      if (context?.previousAccounts) {
        queryClient.setQueryData(["accounts", workspaceId], context.previousAccounts);
      }
      addToast(err?.message || "Failed to delete transaction", "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["accounts", workspaceId] });
    },
  });
}
