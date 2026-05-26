import { z } from "zod";
import type { TransactionType, AccountType, CategoryType } from "./entities";

// ─── Shared field schemas ─────────────────────────────────────────────────────

const uuidSchema = z.string().uuid("Must be a valid UUID");
const isoDateSchema = z.string().datetime({ message: "Must be a valid ISO 8601 date" });
const centsSchema = z
  .number()
  .int("Amount must be a whole number (stored in cents)")
  .nonnegative("Amount must not be negative");

// ─── Workspace ────────────────────────────────────────────────────────────────

export const workspaceSchema = z.object({
  id: uuidSchema,
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  currency: z.string().length(3, "Currency must be a 3-letter ISO 4217 code"),
  created_at: isoDateSchema,
  updated_at: isoDateSchema,
  is_default: z.boolean(),
});

export const createWorkspaceSchema = workspaceSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// ─── Settings ────────────────────────────────────────────────────────────────

export const settingsSchema = z.object({
  id: uuidSchema,
  workspace_id: uuidSchema,
  theme: z.enum(["light", "dark", "system"]),
  currency: z.string().length(3, "Currency must be a 3-letter ISO 4217 code"),
  locale: z.string().min(2, "Locale required"),
  first_day_of_week: z.union([z.literal(0), z.literal(1)]),
  created_at: isoDateSchema,
  updated_at: isoDateSchema,
});

// ─── Account ──────────────────────────────────────────────────────────────────

export const accountTypeSchema = z.enum([
  "checking",
  "savings",
  "cash",
  "credit",
  "investment",
  "other",
] satisfies [AccountType, ...AccountType[]]);

export const accountSchema = z.object({
  id: uuidSchema,
  workspace_id: uuidSchema,
  name: z.string().min(1, "Account name is required").max(100),
  type: accountTypeSchema,
  balance: centsSchema,
  currency: z.string().length(3),
  color: z.string().optional(),
  icon: z.string().optional(),
  is_default: z.boolean(),
  created_at: isoDateSchema,
  updated_at: isoDateSchema,
  deleted_at: isoDateSchema.optional(),
});

export const createAccountSchema = accountSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

export const updateAccountSchema = createAccountSchema.partial().extend({
  id: uuidSchema,
});

// ─── Category ─────────────────────────────────────────────────────────────────

export const categoryTypeSchema = z.enum([
  "expense",
  "income",
] satisfies [CategoryType, ...CategoryType[]]);

export const categorySchema = z.object({
  id: uuidSchema,
  workspace_id: uuidSchema,
  name: z.string().min(1, "Category name is required").max(80),
  type: categoryTypeSchema,
  color: z.string().optional(),
  icon: z.string().optional(),
  sort_order: z.number().int().nonnegative(),
  created_at: isoDateSchema,
  updated_at: isoDateSchema,
  deleted_at: isoDateSchema.optional(),
});

export const createCategorySchema = categorySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  id: uuidSchema,
});

// ─── Transaction ──────────────────────────────────────────────────────────────

export const transactionTypeSchema = z.enum([
  "expense",
  "income",
  "transfer",
] satisfies [TransactionType, ...TransactionType[]]);

export const transactionBaseSchema = z.object({
  id: uuidSchema,
  workspace_id: uuidSchema,
  account_id: uuidSchema,
  category_id: uuidSchema.optional(),
  type: transactionTypeSchema,
  amount: centsSchema,
  currency: z.string().length(3),
  description: z.string().max(255).optional(),
  notes: z.string().max(2000).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format"),
  transfer_account_id: uuidSchema.optional(),
  created_at: isoDateSchema,
  updated_at: isoDateSchema,
  deleted_at: isoDateSchema.optional(),
});

export const transactionSchema = transactionBaseSchema.refine(
  (data) => {
    // Transfer transactions must specify the destination account
    if (data.type === "transfer") {
      return !!data.transfer_account_id;
    }
    return true;
  },
  {
    message: "Transfer transactions require a transfer_account_id",
    path: ["transfer_account_id"],
  }
);

export const createTransactionSchema = transactionBaseSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
}).refine(
  (data) => {
    if (data.type === "transfer") {
      return !!data.transfer_account_id;
    }
    return true;
  },
  {
    message: "Transfer transactions require a transfer_account_id",
    path: ["transfer_account_id"],
  }
);

export const updateTransactionSchema = transactionBaseSchema.omit({
  created_at: true,
  updated_at: true,
  deleted_at: true,
}).partial().extend({
  id: uuidSchema,
}).refine(
  (data) => {
    if (data.type === "transfer") {
      return !!data.transfer_account_id;
    }
    return true;
  },
  {
    message: "Transfer transactions require a transfer_account_id",
    path: ["transfer_account_id"],
  }
);

// ─── Inferred Types from Zod ──────────────────────────────────────────────────

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
