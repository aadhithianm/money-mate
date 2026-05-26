import { transactionRepository } from "@/repositories/TransactionRepository";
import { accountRepository } from "@/repositories/AccountRepository";
import {
  createTransactionSchema,
  updateTransactionSchema,
  type CreateTransactionInput,
  type UpdateTransactionInput,
} from "@/types/schemas";
import { ValidationError } from "@/types/errors";
import { syncQueue } from "@/sync/SyncQueue";
import type { Transaction } from "@/types/entities";

export class TransactionService {
  async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
    // 1. Validate input schema
    const result = createTransactionSchema.safeParse(input);
    if (!result.success) {
      throw new ValidationError("Invalid transaction fields", result.error.format());
    }
    const parsed = result.data;

    // 2. Verify account exists
    const account = await accountRepository.findById(parsed.account_id);
    if (!account) {
      throw new ValidationError("Source account not found", { account_id: ["Account does not exist"] });
    }

    if (parsed.type === "transfer") {
      if (!parsed.transfer_account_id) {
        throw new ValidationError("Transfer account required", {
          transfer_account_id: ["Required for transfer transactions"],
        });
      }
      const destAccount = await accountRepository.findById(parsed.transfer_account_id);
      if (!destAccount) {
        throw new ValidationError("Destination transfer account not found", {
          transfer_account_id: ["Account does not exist"],
        });
      }
    }

    // 3. Save to IndexedDB
    const tx = await transactionRepository.createTransaction(parsed);

    // 4. Perform optimistic balance adjustments locally
    if (tx.type === "expense") {
      await accountRepository.adjustBalance(tx.account_id, -tx.amount);
    } else if (tx.type === "income") {
      await accountRepository.adjustBalance(tx.account_id, tx.amount);
    } else if (tx.type === "transfer" && tx.transfer_account_id) {
      await accountRepository.adjustBalance(tx.account_id, -tx.amount);
      await accountRepository.adjustBalance(tx.transfer_account_id, tx.amount);
    }

    // 5. Trigger sync in background
    syncQueue.triggerSync();

    return tx;
  }

  async updateTransaction(input: UpdateTransactionInput): Promise<Transaction> {
    // 1. Validate schema
    const result = updateTransactionSchema.safeParse(input);
    if (!result.success) {
      throw new ValidationError("Invalid transaction update input", result.error.format());
    }
    const parsed = result.data;

    // 2. Fetch existing transaction to reverse balances
    const oldTx = await transactionRepository.findById(parsed.id);
    if (!oldTx) {
      throw new ValidationError("Transaction not found", { id: ["Transaction does not exist"] });
    }

    // 3. Revert old transaction balances optimistically
    if (oldTx.type === "expense") {
      await accountRepository.adjustBalance(oldTx.account_id, oldTx.amount);
    } else if (oldTx.type === "income") {
      await accountRepository.adjustBalance(oldTx.account_id, -oldTx.amount);
    } else if (oldTx.type === "transfer" && oldTx.transfer_account_id) {
      await accountRepository.adjustBalance(oldTx.account_id, oldTx.amount);
      await accountRepository.adjustBalance(oldTx.transfer_account_id, -oldTx.amount);
    }

    // 4. Apply changes
    const updatedTx = await transactionRepository.updateTransaction(parsed);

    // 5. Apply new transaction balances optimistically
    if (updatedTx.type === "expense") {
      await accountRepository.adjustBalance(updatedTx.account_id, -updatedTx.amount);
    } else if (updatedTx.type === "income") {
      await accountRepository.adjustBalance(updatedTx.account_id, updatedTx.amount);
    } else if (updatedTx.type === "transfer" && updatedTx.transfer_account_id) {
      await accountRepository.adjustBalance(updatedTx.account_id, -updatedTx.amount);
      await accountRepository.adjustBalance(updatedTx.transfer_account_id, updatedTx.amount);
    }

    // 6. Trigger sync in background
    syncQueue.triggerSync();

    return updatedTx;
  }

  async deleteTransaction(id: string): Promise<void> {
    const oldTx = await transactionRepository.findById(id);
    if (!oldTx) return;

    // 1. Revert balance impacts optimistically
    if (oldTx.type === "expense") {
      await accountRepository.adjustBalance(oldTx.account_id, oldTx.amount);
    } else if (oldTx.type === "income") {
      await accountRepository.adjustBalance(oldTx.account_id, -oldTx.amount);
    } else if (oldTx.type === "transfer" && oldTx.transfer_account_id) {
      await accountRepository.adjustBalance(oldTx.account_id, oldTx.amount);
      await accountRepository.adjustBalance(oldTx.transfer_account_id, -oldTx.amount);
    }

    // 2. Perform soft delete
    await transactionRepository.deleteTransaction(id);

    // 3. Trigger sync in background
    syncQueue.triggerSync();
  }
}

export const transactionService = new TransactionService();
