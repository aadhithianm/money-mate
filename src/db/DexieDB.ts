import Dexie, { type EntityTable } from "dexie";
import type {
  Workspace,
  Settings,
  Account,
  Category,
  Transaction,
  SyncQueueItem,
} from "@/types/entities";

// ─── Database Table Row Types ────────────────────────────────────────────────
// These extend the entity types with Dexie's auto-incremented local id
// In our case we use UUID strings as primary keys so no autoincrement needed.

type WorkspaceTable = Workspace;
type SettingsTable = Settings;
type AccountTable = Account;
type CategoryTable = Category;
type TransactionTable = Transaction;
type SyncQueueTable = SyncQueueItem;

// ─── Dexie Database Class ─────────────────────────────────────────────────────

export class MoneyMateDB extends Dexie {
  // Strictly typed table declarations via Dexie's EntityTable<Shape, KeyType>
  workspaces!: EntityTable<WorkspaceTable, "id">;
  settings!: EntityTable<SettingsTable, "id">;
  accounts!: EntityTable<AccountTable, "id">;
  categories!: EntityTable<CategoryTable, "id">;
  transactions!: EntityTable<TransactionTable, "id">;
  sync_queue!: EntityTable<SyncQueueTable, "id">;

  constructor() {
    super("money-mate");
    this._defineSchema();
  }

  private _defineSchema() {
    /**
     * ─── Version 1 — Initial Schema ─────────────────────────────────────────
     *
     * Dexie index syntax reference:
     *   ++id       = auto-increment integer primary key (not used — we use UUIDs)
     *   id         = non-auto-incrementing primary key
     *   *field     = multi-entry index (for array values)
     *   [a+b]      = compound index across multiple fields
     *   &field     = unique index
     *
     * Only indexed fields are listed here. Non-indexed fields are still stored.
     */
    this.version(1).stores({
      // ── Workspaces ─────────────────────────────────────────────────────
      workspaces: [
        "id",          // Primary key (UUID)
        "is_default",
        "created_at",
      ].join(", "),

      // ── Settings ───────────────────────────────────────────────────────
      settings: [
        "id",
        "workspace_id", // FK index for per-workspace lookups
      ].join(", "),

      // ── Accounts ───────────────────────────────────────────────────────
      accounts: [
        "id",
        "workspace_id",
        "type",
        "is_default",
        "deleted_at",   // Index to efficiently filter soft-deleted rows
        "created_at",
      ].join(", "),

      // ── Categories ─────────────────────────────────────────────────────
      categories: [
        "id",
        "workspace_id",
        "type",
        "sort_order",
        "deleted_at",
        "created_at",
        "[workspace_id+type]",          // Compound index for typed category lists
      ].join(", "),

      // ── Transactions ───────────────────────────────────────────────────
      transactions: [
        "id",
        "workspace_id",
        "account_id",
        "category_id",
        "type",
        "date",         // Primary filter for date-range queries
        "deleted_at",
        "created_at",
        "[workspace_id+date]",          // Compound: workspace scoped date sorting
        "[workspace_id+account_id]",    // Compound: account-specific feed
        "[workspace_id+type]",          // Compound: type-filtered feed
      ].join(", "),

      // ── Sync Queue ─────────────────────────────────────────────────────
      sync_queue: [
        "id",
        "operation",
        "entity_type",
        "entity_id",
        "status",        // Index for filtering PENDING/FAILED items
        "retry_count",
        "created_at",
        "[status+created_at]", // Compound: ordered queue processing
      ].join(", "),
    });

    /**
     * ─── Future Migrations Template ─────────────────────────────────────────
     *
     * When schema changes are needed, add a new version block:
     *
     * this.version(2).stores({
     *   // New or modified table definitions
     *   transactions: "id, workspace_id, account_id, ..., new_field",
     * }).upgrade(async (tx) => {
     *   // Data migration logic
     *   await tx.table("transactions").toCollection().modify((row) => {
     *     row.new_field = defaultValue;
     *   });
     * });
     *
     * Rules:
     * - Always increment version number
     * - Never modify a previous version block
     * - Use .upgrade() for data migrations
     * - Keep all previous version blocks intact for rollback compatibility
     */
  }
}

// ─── Singleton Instance ──────────────────────────────────────────────────────
// Safe to call multiple times — Dexie handles browser tab sharing internally.

export const db = new MoneyMateDB();

// ─── Helper: Reset database (for dev/testing only) ──────────────────────────

export async function resetDatabase(): Promise<void> {
  if (process.env.NODE_ENV !== "development") {
    console.warn("[DB] resetDatabase() is only available in development.");
    return;
  }
  await db.delete();
  console.log("[DB] Database deleted. Reload to reinitialize.");
}
