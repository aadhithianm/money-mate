import { db } from "@/db/DexieDB";
import type { FinancialEventRecord } from "@/types/entities";
import { DatabaseError, toAppError } from "@/types/errors";
import { BaseRepository } from "./BaseRepository";

export class FinancialEventRepository extends BaseRepository<FinancialEventRecord> {
  protected readonly tableName = "financial_events";

  /**
   * Appends an immutable financial event record to the local event ledger.
   * By rule, events are write-once and can never be updated or deleted.
   */
  async recordEvent(input: Omit<FinancialEventRecord, "id" | "created_at">): Promise<FinancialEventRecord> {
    try {
      const now = this.nowISO();
      const event: FinancialEventRecord = {
        id: this.newId(),
        ...input,
        created_at: now,
      };
      
      // Save directly to Dexie local event store
      await this.create(event);
      
      // Queue background remote sync
      await this.enqueueSync("CREATE", "settings" as any, event.id, event); // Maps to custom table if remote handles it
      
      return event;
    } catch (err) {
      throw new DatabaseError("Failed to record immutable financial event", "recordEvent", toAppError(err));
    }
  }

  /**
   * Retrieves chronological event stream for the workspace.
   */
  async getEventStream(workspaceId: string, limit = 200): Promise<FinancialEventRecord[]> {
    try {
      return await db.financial_events
        .where("workspace_id")
        .equals(workspaceId)
        .reverse()
        .sortBy("created_at")
        .then((items) => items.slice(0, limit));
    } catch (err) {
      throw new DatabaseError("Failed to fetch event stream", "getEventStream", toAppError(err));
    }
  }
}

export const financialEventRepository = new FinancialEventRepository();
