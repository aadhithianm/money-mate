/**
 * Money Mate — Core Entity Types
 * All entities scope under a workspace_id.
 * Soft deletes are used; hard deletes are forbidden.
 */

// ─── Primitives ──────────────────────────────────────────────────────────────

export type UUID = string;
export type ISODateString = string; // ISO 8601 date string

export type TransactionType = "expense" | "income" | "transfer";
export type AccountType = "checking" | "savings" | "cash" | "credit" | "investment" | "other";
export type CategoryType = "expense" | "income";

// ─── Workspace ───────────────────────────────────────────────────────────────

export interface Workspace {
  id: UUID;
  name: string;
  currency: string;        // ISO 4217 e.g. "USD", "INR"
  created_at: ISODateString;
  updated_at: ISODateString;
  is_default: boolean;
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface Settings {
  id: UUID;
  workspace_id: UUID;
  theme: "light" | "dark" | "system";
  currency: string;
  locale: string;          // BCP 47 e.g. "en-US"
  first_day_of_week: 0 | 1; // 0 = Sunday, 1 = Monday
  created_at: ISODateString;
  updated_at: ISODateString;
}

// ─── Account ─────────────────────────────────────────────────────────────────

export interface Account {
  id: UUID;
  workspace_id: UUID;
  name: string;
  type: AccountType;
  balance: number;         // Stored in cents (integer) to avoid float errors
  currency: string;
  color?: string;
  icon?: string;
  is_default: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
  deleted_at?: ISODateString; // Soft delete
}

// ─── Category ────────────────────────────────────────────────────────────────

export interface Category {
  id: UUID;
  workspace_id: UUID;
  name: string;
  type: CategoryType;
  color?: string;
  icon?: string;
  sort_order: number;
  created_at: ISODateString;
  updated_at: ISODateString;
  deleted_at?: ISODateString; // Soft delete
}

// ─── Transaction ─────────────────────────────────────────────────────────────

export interface Transaction {
  id: UUID;
  workspace_id: UUID;
  account_id: UUID;
  category_id?: UUID;
  type: TransactionType;
  amount: number;          // Stored in cents (integer)
  currency: string;
  description?: string;
  notes?: string;
  date: ISODateString;     // Transaction date (user-specified, not created_at)
  transfer_account_id?: UUID; // Populated when type === "transfer"
  created_at: ISODateString;
  updated_at: ISODateString;
  deleted_at?: ISODateString; // Soft delete
}

// ─── Sync Queue ───────────────────────────────────────────────────────────────

export type SyncOperation = "CREATE" | "UPDATE" | "DELETE";
export type SyncEntityType = "transaction" | "account" | "category" | "workspace" | "settings";
export type SyncStatus = "PENDING" | "SYNCING" | "DONE" | "FAILED";

export interface SyncQueueItem {
  id: UUID;
  operation: SyncOperation;
  entity_type: SyncEntityType;
  entity_id: UUID;
  payload: Record<string, unknown>;
  status: SyncStatus;
  retry_count: number;
  error_message?: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

// ─── Repository Response ─────────────────────────────────────────────────────

export interface RepositoryResult<T> {
  data: T | null;
  error: SerializedAppError | null;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
  cursor?: string;
}

// ─── Application Error ───────────────────────────────────────────────────────

export type AppErrorCode =
  | "VALIDATION_ERROR"
  | "DATABASE_ERROR"
  | "SYNC_ERROR"
  | "NETWORK_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "CONFLICT"
  | "UNKNOWN";

export interface SerializedAppError {
  code: AppErrorCode;
  message: string;
  details?: unknown;
  timestamp: ISODateString;
}
