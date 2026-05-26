import { accountRepository } from "@/repositories/AccountRepository";
import {
  createAccountSchema,
  updateAccountSchema,
  type CreateAccountInput,
  type UpdateAccountInput,
} from "@/types/schemas";
import { ValidationError } from "@/types/errors";
import { syncQueue } from "@/sync/SyncQueue";
import type { Account } from "@/types/entities";

export class AccountService {
  async createAccount(input: CreateAccountInput): Promise<Account> {
    const result = createAccountSchema.safeParse(input);
    if (!result.success) {
      throw new ValidationError("Invalid account fields", result.error.format());
    }

    const account = await accountRepository.createAccount(result.data);
    syncQueue.triggerSync();
    return account;
  }

  async updateAccount(input: UpdateAccountInput): Promise<Account> {
    const result = updateAccountSchema.safeParse(input);
    if (!result.success) {
      throw new ValidationError("Invalid account update fields", result.error.format());
    }

    const account = await accountRepository.updateAccount(result.data);
    syncQueue.triggerSync();
    return account;
  }

  async deleteAccount(id: string): Promise<void> {
    await accountRepository.deleteAccount(id);
    syncQueue.triggerSync();
  }
}

export const accountService = new AccountService();
