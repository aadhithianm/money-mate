import { db } from "@/db/DexieDB";
import type { SyncQueueItem, SyncEntityType, SyncOperation } from "@/types/entities";
import { DatabaseError, toAppError } from "@/types/errors";

// ─── Abstract Base Repository ────────────────────────────────────────────────

export abstract class BaseRepository<T extends { id: string; workspace_id: string }> {
  protected abstract readonly tableName: string;

  protected get table() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (db as any)[this.tableName] as Dexie.Table<T, string>;
  }

  // ── Core CRUD ──────────────────────────────────────────────────────────────

  async findById(id: string): Promise<T | undefined> {
    try {
      return await this.table.get(id);
    } catch (err) {
      throw new DatabaseError(`Failed to find ${this.tableName} by id`, "findById", toAppError(err));
    }
  }

  async findAll(workspaceId: string): Promise<T[]> {
    try {
      return await this.table
        .where("workspace_id")
        .equals(workspaceId)
        .filter((row) => !(row as Record<string, unknown>)["deleted_at"])
        .toArray();
    } catch (err) {
      throw new DatabaseError(`Failed to list ${this.tableName}`, "findAll", toAppError(err));
    }
  }

  async create(item: T): Promise<T> {
    try {
      await this.table.add(item);
      return item;
    } catch (err) {
      throw new DatabaseError(`Failed to create ${this.tableName}`, "create", toAppError(err));
    }
  }

  async update(id: string, changes: Partial<T>): Promise<T> {
    try {
      const updated = {
        ...changes,
        updated_at: new Date().toISOString(),
      };
      await this.table.update(id, updated as any);
      const result = await this.table.get(id);
      if (!result) throw new DatabaseError(`Record ${id} not found after update`, "update");
      return result;
    } catch (err) {
      if (err instanceof DatabaseError) throw err;
      throw new DatabaseError(`Failed to update ${this.tableName}`, "update", toAppError(err));
    }
  }

  async softDelete(id: string): Promise<void> {
    try {
      await this.table.update(id, {
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any);
    } catch (err) {
      throw new DatabaseError(`Failed to soft delete ${this.tableName}`, "softDelete", toAppError(err));
    }
  }

  async hardDelete(id: string): Promise<void> {
    try {
      await this.table.delete(id);
    } catch (err) {
      throw new DatabaseError(`Failed to hard delete ${this.tableName}`, "hardDelete", toAppError(err));
    }
  }

  // ── Sync Queue Integration ─────────────────────────────────────────────────

  protected async enqueueSync(
    operation: SyncOperation,
    entityType: SyncEntityType,
    entityId: string,
    payload: any
  ): Promise<void> {
    try {
      const now = new Date().toISOString();
      const queueItem: SyncQueueItem = {
        id: crypto.randomUUID(),
        operation,
        entity_type: entityType,
        entity_id: entityId,
        payload,
        status: "PENDING",
        retry_count: 0,
        created_at: now,
        updated_at: now,
      };
      await db.sync_queue.add(queueItem);
    } catch (err) {
      // Non-fatal: log but don't throw — offline queue failure should not block UI
      console.error("[BaseRepository] Failed to enqueue sync item:", toAppError(err));
    }
  }

  // ── Utility Helpers ────────────────────────────────────────────────────────

  protected nowISO(): string {
    return new Date().toISOString();
  }

  protected newId(): string {
    return crypto.randomUUID();
  }
}

// ─── Dexie Import (for typing only) ─────────────────────────────────────────
import Dexie from "dexie";
