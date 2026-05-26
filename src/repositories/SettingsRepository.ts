import { db } from "@/db/DexieDB";
import type { Settings } from "@/types/entities";
import { DatabaseError, toAppError } from "@/types/errors";
import { BaseRepository } from "./BaseRepository";

export class SettingsRepository extends BaseRepository<Settings> {
  protected readonly tableName = "settings";

  // ── Query: get settings by workspace ────────────────────────────────────────

  async getSettingsForWorkspace(workspaceId: string): Promise<Settings | undefined> {
    try {
      return await db.settings
        .where("workspace_id")
        .equals(workspaceId)
        .first();
    } catch (err) {
      throw new DatabaseError("Failed to get settings for workspace", "getSettingsForWorkspace", toAppError(err));
    }
  }

  // ── Upsert: create or update settings ───────────────────────────────────────

  async upsertSettings(workspaceId: string, changes: Partial<Settings>): Promise<Settings> {
    try {
      const existing = await this.getSettingsForWorkspace(workspaceId);
      const now = this.nowISO();

      if (existing) {
        // Update existing record
        const updated = await this.update(existing.id, changes);
        await this.enqueueSync("UPDATE", "settings", existing.id, updated);
        return updated;
      } else {
        // Create new settings record with defaults
        const newSettings: Settings = {
          id: this.newId(),
          workspace_id: workspaceId,
          theme: changes.theme || "system",
          currency: changes.currency || "USD",
          locale: changes.locale || "en-US",
          first_day_of_week: changes.first_day_of_week !== undefined ? changes.first_day_of_week : 0,
          created_at: now,
          updated_at: now,
        };
        await this.create(newSettings);
        await this.enqueueSync("CREATE", "settings", newSettings.id, newSettings);
        return newSettings;
      }
    } catch (err) {
      if (err instanceof DatabaseError) throw err;
      throw new DatabaseError("Failed to upsert settings", "upsertSettings", toAppError(err));
    }
  }
}

export const settingsRepository = new SettingsRepository();
