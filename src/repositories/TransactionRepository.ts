import { db } from "@/db/DexieDB";
import type { Transaction } from "@/types/entities";
import type { TransactionFilter } from "@/types/sync";
import type { CreateTransactionInput, UpdateTransactionInput } from "@/types/schemas";
import { DatabaseError, toAppError } from "@/types/errors";
import { BaseRepository } from "./BaseRepository";

export class TransactionRepository extends BaseRepository<Transaction> {
  protected readonly tableName = "transactions";

  // ── Create with sync queue ─────────────────────────────────────────────────

  async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
    const now = this.nowISO();
    const transaction: Transaction = {
      id: this.newId(),
      ...input,
      created_at: now,
      updated_at: now,
    };

    await this.create(transaction);
    await this.enqueueSync("CREATE", "transaction", transaction.id, transaction);
    return transaction;
  }

  // ── Update with sync queue ─────────────────────────────────────────────────

  async updateTransaction(input: UpdateTransactionInput): Promise<Transaction> {
    const { id, ...changes } = input;
    const updated = await this.update(id, changes as Partial<Transaction>);
    const full = await this.findById(id);
    if (full) {
      await this.enqueueSync("UPDATE", "transaction", id, full);
    }
    return updated;
  }

  // ── Soft delete with sync queue ────────────────────────────────────────────

  async deleteTransaction(id: string): Promise<void> {
    await this.softDelete(id);
    await this.enqueueSync("DELETE", "transaction", id, { id, deleted_at: this.nowISO() });
  }

  // ── Query: date-range scoped feed ─────────────────────────────────────────

  async listByFilter(filter: TransactionFilter): Promise<Transaction[]> {
    try {
      let collection = db.transactions
        .where("[workspace_id+date]")
        .between(
          [filter.workspace_id, filter.date_from ?? "0000-00-00"],
          [filter.workspace_id, filter.date_to ?? "9999-99-99"],
          true,
          true
        );

      const results = await collection.toArray();

      return results.filter((tx) => {
        if (tx.deleted_at) return false;
        if (filter.account_id && tx.account_id !== filter.account_id) return false;
        if (filter.category_id && tx.category_id !== filter.category_id) return false;
        if (filter.type && tx.type !== filter.type) return false;
        if (filter.search) {
          const q = filter.search.toLowerCase();
          return (
            tx.description?.toLowerCase().includes(q) ||
            tx.notes?.toLowerCase().includes(q) ||
            false
          );
        }
        return true;
      });
    } catch (err) {
      throw new DatabaseError("Failed to list transactions by filter", "listByFilter", toAppError(err));
    }
  }

  // ── Query: account-specific transactions ──────────────────────────────────

  async listByAccount(workspaceId: string, accountId: string): Promise<Transaction[]> {
    try {
      return await db.transactions
        .where("[workspace_id+account_id]")
        .equals([workspaceId, accountId])
        .filter((tx) => !tx.deleted_at)
        .sortBy("date");
    } catch (err) {
      throw new DatabaseError("Failed to list transactions by account", "listByAccount", toAppError(err));
    }
  }

  // ── Query: recent N transactions ──────────────────────────────────────────

  async listRecent(workspaceId: string, limit = 50): Promise<Transaction[]> {
    try {
      return await db.transactions
        .where("workspace_id")
        .equals(workspaceId)
        .filter((tx) => !tx.deleted_at)
        .reverse()
        .sortBy("date")
        .then((items) => items.slice(0, limit));
    } catch (err) {
      throw new DatabaseError("Failed to list recent transactions", "listRecent", toAppError(err));
    }
  }
}

export const transactionRepository = new TransactionRepository();
