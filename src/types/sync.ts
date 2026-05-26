import type {
  UUID,
  ISODateString,
  SyncOperation,
  SyncEntityType,
  SyncStatus,
} from "./entities";

// ─── Sync Queue Item (storage shape) ────────────────────────────────────────

export interface SyncQueueRecord {
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

// ─── Sync Engine States ──────────────────────────────────────────────────────

export type SyncEngineStatus = "idle" | "syncing" | "error" | "offline";

export interface SyncState {
  status: SyncEngineStatus;
  lastSyncAt: ISODateString | null;
  pendingCount: number;
  failedCount: number;
}

// ─── Sync Processor Result ───────────────────────────────────────────────────

export interface SyncProcessResult {
  success: boolean;
  itemId: UUID;
  error?: string;
  shouldRetry: boolean;
}

// ─── Supabase API Response Shapes ───────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  code: string;
  message: string;
  hint?: string;
  details?: unknown;
}

// ─── Filter & Query Types ────────────────────────────────────────────────────

export interface TransactionFilter {
  workspace_id: UUID;
  account_id?: UUID;
  category_id?: UUID;
  type?: "expense" | "income" | "transfer";
  date_from?: ISODateString;
  date_to?: ISODateString;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface AccountFilter {
  workspace_id: UUID;
  type?: string;
}

export interface CategoryFilter {
  workspace_id: UUID;
  type?: "expense" | "income";
}
