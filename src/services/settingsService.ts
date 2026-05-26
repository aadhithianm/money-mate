import { settingsRepository } from "@/repositories/SettingsRepository";
import { settingsSchema } from "@/types/schemas";
import { ValidationError } from "@/types/errors";
import { syncQueue } from "@/sync/SyncQueue";
import type { Settings } from "@/types/entities";

export class SettingsService {
  async getSettings(workspaceId: string): Promise<Settings | undefined> {
    return await settingsRepository.getSettingsForWorkspace(workspaceId);
  }

  async updateSettings(workspaceId: string, changes: Partial<Settings>): Promise<Settings> {
    // Perform partial validation if theme, locale, etc. are passed
    const existing = await settingsRepository.getSettingsForWorkspace(workspaceId);
    
    // Merge new changes with existing settings to perform a full validation check
    const merged = {
      id: existing?.id || crypto.randomUUID(),
      workspace_id: workspaceId,
      theme: changes.theme || existing?.theme || "system",
      currency: changes.currency || existing?.currency || "USD",
      locale: changes.locale || existing?.locale || "en-US",
      first_day_of_week: changes.first_day_of_week !== undefined ? changes.first_day_of_week : (existing?.first_day_of_week ?? 0),
      created_at: existing?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = settingsSchema.safeParse(merged);
    if (!result.success) {
      throw new ValidationError("Invalid settings fields", result.error.format());
    }

    const updated = await settingsRepository.upsertSettings(workspaceId, changes);
    syncQueue.triggerSync();
    return updated;
  }
}

export const settingsService = new SettingsService();
