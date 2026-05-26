import { db } from "@/db/DexieDB";
import type { Account } from "@/types/entities";
import type { CreateAccountInput, UpdateAccountInput } from "@/types/schemas";
import { DatabaseError, toAppError } from "@/types/errors";
import { BaseRepository } from "./BaseRepository";

export class AccountRepository extends BaseRepository<Account> {
  protected readonly tableName = "accounts";

  // ── Create with sync queue ─────────────────────────────────────────────────

  async createAccount(input: CreateAccountInput): Promise<Account> {
    const now = this.nowISO();
    const account: Account = {
      id: this.newId(),
      ...input,
      created_at: now,
      updated_at: now,
    };

    await this.create(account);
    await this.enqueueSync("CREATE", "account", account.id, account);
    return account;
  }

  // ── Update with sync queue ─────────────────────────────────────────────────

  async updateAccount(input: UpdateAccountInput): Promise<Account> {
    const { id, ...changes } = input;
    const updated = await this.update(id, changes as Partial<Account>);
    const full = await this.findById(id);
    if (full) {
      await this.enqueueSync("UPDATE", "account", id, full);
    }
    return updated;
  }

  // ── Soft delete with sync queue ────────────────────────────────────────────

  async deleteAccount(id: string): Promise<void> {
    await this.softDelete(id);
    await this.enqueueSync("DELETE", "account", id, { id, deleted_at: this.nowISO() });
  }

  // ── Adjust balance (optimistic, local only) ────────────────────────────────
  // Called by TransactionService when a transaction is created/updated/deleted.
  // The balance adjustment is an optimistic local operation — the authoritative
  // balance is always computed server-side and pulled down on next sync.

  async adjustBalance(accountId: string, deltaInCents: number): Promise<void> {
    try {
      const account = await this.findById(accountId);
      if (!account) return;

      await this.update(accountId, {
        balance: account.balance + deltaInCents,
      } as Partial<Account>);
    } catch (err) {
      throw new DatabaseError("Failed to adjust account balance", "adjustBalance", toAppError(err));
    }
  }

  // ── Query: default account for workspace ─────────────────────────────────

  async getDefault(workspaceId: string): Promise<Account | undefined> {
    try {
      return await db.accounts
        .where("workspace_id")
        .equals(workspaceId)
        .filter((a) => a.is_default && !a.deleted_at)
        .first();
    } catch (err) {
      throw new DatabaseError("Failed to get default account", "getDefault", toAppError(err));
    }
  }
}

export const accountRepository = new AccountRepository();
