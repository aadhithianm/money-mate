import { transactionRepository } from "@/repositories/TransactionRepository";
import { accountRepository } from "@/repositories/AccountRepository";
import { categoryRepository } from "@/repositories/CategoryRepository";
import { financialEventRepository } from "@/repositories/FinancialEventRepository";
import {
  createTransactionSchema,
  updateTransactionSchema,
  type CreateTransactionInput,
  type UpdateTransactionInput,
} from "@/types/schemas";
import { ValidationError } from "@/types/errors";
import { syncQueue } from "@/sync/SyncQueue";
import type { Transaction, FinancialEventCategory } from "@/types/entities";
import { financialEventService } from "@/services/financialEventService";

/**
 * Analyzes transaction descriptors and categories to map it into one of our
 * 6 immutable Financial Event categories.
 */
async function determineEventCategory(
  type: string,
  description?: string,
  categoryId?: string
): Promise<FinancialEventCategory> {
  if (type === "transfer") return "transfer";
  
  const q = (description || "").toLowerCase();
  if (q.includes("refund")) return "refund";
  if (q.includes("settle") || q.includes("settlement")) return "settlement";

  if (categoryId) {
    try {
      const category = await categoryRepository.findById(categoryId);
      if (category) {
        const catName = category.name.toLowerCase();
        if (
          catName.includes("recurring") ||
          catName.includes("subscription") ||
          catName.includes("monthly") ||
          q.includes("recurring") ||
          q.includes("subscription")
        ) {
          return "recurring";
        }
      }
    } catch {
      // Non-fatal, fallback to raw transaction type
    }
  }

  return type as FinancialEventCategory;
}

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
      const updated = await accountRepository.findById(tx.account_id);
      if (updated && updated.balance < 10000 && account.balance >= 10000) {
        financialEventService.emit(
          "low_balance",
          `Low balance warning: ${account.name} is below $100.00 ($${(updated.balance / 100).toFixed(2)})`,
          { accountId: account.id, accountName: account.name, balance: updated.balance }
        );
      }
    } else if (tx.type === "income") {
      await accountRepository.adjustBalance(tx.account_id, tx.amount);
    } else if (tx.type === "transfer" && tx.transfer_account_id) {
      await accountRepository.adjustBalance(tx.account_id, -tx.amount);
      const updated = await accountRepository.findById(tx.account_id);
      if (updated && updated.balance < 10000 && account.balance >= 10000) {
        financialEventService.emit(
          "low_balance",
          `Low balance warning: ${account.name} is below $100.00 ($${(updated.balance / 100).toFixed(2)})`,
          { accountId: account.id, accountName: account.name, balance: updated.balance }
        );
      }
      await accountRepository.adjustBalance(tx.transfer_account_id, tx.amount);
    }

    // 5. Generate Immutable Ledger Event
    const eventCategory = await determineEventCategory(tx.type, tx.description, tx.category_id);
    await financialEventRepository.recordEvent({
      workspace_id: tx.workspace_id,
      account_id: tx.account_id,
      type: eventCategory,
      amount: tx.amount,
      currency: tx.currency,
      description: tx.description || `Created ${tx.type} ledger entry`,
      reference_id: tx.id,
      metadata: { operation: "CREATE", category_id: tx.category_id },
    });

    // Emit live event for visual notification triggers
    financialEventService.emit(
      "transaction_created",
      `Added ${tx.type}: $${(tx.amount / 100).toFixed(2)}`,
      { transaction: tx, accountId: tx.account_id, accountName: account.name }
    );

    // 6. Trigger sync in background
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

    // Get primary account details for low balance checks
    const account = await accountRepository.findById(oldTx.account_id);

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
      const updated = await accountRepository.findById(updatedTx.account_id);
      if (updated && account && updated.balance < 10000 && account.balance >= 10000) {
        financialEventService.emit(
          "low_balance",
          `Low balance warning: ${account.name} is below $100.00 ($${(updated.balance / 100).toFixed(2)})`,
          { accountId: account.id, accountName: account.name, balance: updated.balance }
        );
      }
    } else if (updatedTx.type === "income") {
      await accountRepository.adjustBalance(updatedTx.account_id, updatedTx.amount);
    } else if (updatedTx.type === "transfer" && updatedTx.transfer_account_id) {
      await accountRepository.adjustBalance(updatedTx.account_id, -updatedTx.amount);
      const updated = await accountRepository.findById(updatedTx.account_id);
      if (updated && account && updated.balance < 10000 && account.balance >= 10000) {
        financialEventService.emit(
          "low_balance",
          `Low balance warning: ${account.name} is below $100.00 ($${(updated.balance / 100).toFixed(2)})`,
          { accountId: account.id, accountName: account.name, balance: updated.balance }
        );
      }
      await accountRepository.adjustBalance(updatedTx.transfer_account_id, updatedTx.amount);
    }

    // 6. Generate Immutable Ledger Event (Record edit as new event keeping history)
    const eventCategory = await determineEventCategory(updatedTx.type, updatedTx.description, updatedTx.category_id);
    await financialEventRepository.recordEvent({
      workspace_id: updatedTx.workspace_id,
      account_id: updatedTx.account_id,
      type: eventCategory,
      amount: updatedTx.amount,
      currency: updatedTx.currency,
      description: updatedTx.description || `Updated ${updatedTx.type} ledger entry`,
      reference_id: updatedTx.id,
      metadata: { operation: "UPDATE", category_id: updatedTx.category_id, old_amount: oldTx.amount },
    });

    // Emit live event
    financialEventService.emit(
      "transaction_updated",
      `Updated ${updatedTx.type}: $${(updatedTx.amount / 100).toFixed(2)}`,
      { transaction: updatedTx, accountId: updatedTx.account_id }
    );

    // 7. Trigger sync in background
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

    // 3. Generate Immutable Ledger Event (Cancellation is represented as new clearing event)
    const eventCategory = await determineEventCategory(oldTx.type, oldTx.description, oldTx.category_id);
    await financialEventRepository.recordEvent({
      workspace_id: oldTx.workspace_id,
      account_id: oldTx.account_id,
      type: "settlement", // Represent deletion as a settlement event
      amount: oldTx.amount,
      currency: oldTx.currency,
      description: `Cancelled ${oldTx.type}: ${oldTx.description || ""}`,
      reference_id: oldTx.id,
      metadata: { operation: "DELETE", original_event: eventCategory },
    });

    // Emit live event
    financialEventService.emit(
      "transaction_deleted",
      `Deleted ${oldTx.type}: $${(oldTx.amount / 100).toFixed(2)}`,
      { transactionId: id, transaction: oldTx, accountId: oldTx.account_id }
    );

    // 4. Trigger sync in background
    syncQueue.triggerSync();
  }
}

export const transactionService = new TransactionService();
