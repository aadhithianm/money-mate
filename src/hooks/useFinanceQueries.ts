import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionRepository } from "@/repositories/TransactionRepository";
import { accountRepository } from "@/repositories/AccountRepository";
import { categoryRepository } from "@/repositories/CategoryRepository";
import { transactionService } from "@/services/transactionService";
import { accountService } from "@/services/accountService";
import { categoryService } from "@/services/categoryService";
import type { CreateTransactionInput, UpdateTransactionInput } from "@/types/schemas";
import type { CreateAccountInput, UpdateAccountInput } from "@/types/schemas";
import type { CreateCategoryInput, UpdateCategoryInput } from "@/types/schemas";
import type { TransactionFilter } from "@/types/sync";
import type { CategoryType } from "@/types/entities";

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const queryKeys = {
  transactions: (filter: TransactionFilter) => ["transactions", filter] as const,
  allTransactions: () => ["transactions"] as const,
  accounts: (workspaceId: string) => ["accounts", workspaceId] as const,
  allAccounts: () => ["accounts"] as const,
  categories: (workspaceId: string, type: CategoryType) => ["categories", workspaceId, type] as const,
  allCategories: () => ["categories"] as const,
};

// ─── Transaction Hooks ───────────────────────────────────────────────────────

export function useTransactions(filter: TransactionFilter) {
  return useQuery({
    queryKey: queryKeys.transactions(filter),
    queryFn: () => transactionRepository.listByFilter(filter),
    // Local database values are authoritative; infinite staleTime ensures we only
    // re-query when we explicitly invalidate the cache upon local writes.
    staleTime: Infinity,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTransactionInput) => transactionService.createTransaction(input),
    onSuccess: () => {
      // Invalidate both transactions and accounts to trigger instant reactive re-renders
      queryClient.invalidateQueries({ queryKey: queryKeys.allTransactions() });
      queryClient.invalidateQueries({ queryKey: queryKeys.allAccounts() });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateTransactionInput) => transactionService.updateTransaction(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allTransactions() });
      queryClient.invalidateQueries({ queryKey: queryKeys.allAccounts() });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => transactionService.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allTransactions() });
      queryClient.invalidateQueries({ queryKey: queryKeys.allAccounts() });
    },
  });
}

// ─── Account Hooks ───────────────────────────────────────────────────────────

export function useAccounts(workspaceId: string) {
  return useQuery({
    queryKey: queryKeys.accounts(workspaceId),
    queryFn: () => accountRepository.findAll(workspaceId),
    staleTime: Infinity,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAccountInput) => accountService.createAccount(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allAccounts() });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateAccountInput) => accountService.updateAccount(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allAccounts() });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => accountService.deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allAccounts() });
      // Deleting an account could impact transactions, so invalidate them too
      queryClient.invalidateQueries({ queryKey: queryKeys.allTransactions() });
    },
  });
}

// ─── Category Hooks ──────────────────────────────────────────────────────────

export function useCategories(workspaceId: string, type: CategoryType) {
  return useQuery({
    queryKey: queryKeys.categories(workspaceId, type),
    queryFn: () => categoryRepository.listByType(workspaceId, type),
    staleTime: Infinity,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCategoryInput) => categoryService.createCategory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allCategories() });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateCategoryInput) => categoryService.updateCategory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allCategories() });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allCategories() });
    },
  });
}
