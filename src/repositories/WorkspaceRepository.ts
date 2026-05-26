import { db } from "@/db/DexieDB";
import type { Workspace, Category } from "@/types/entities";
import type { CreateWorkspaceInput } from "@/types/schemas";
import { DatabaseError, toAppError } from "@/types/errors";
import { BaseRepository } from "./BaseRepository";
import { settingsRepository } from "./SettingsRepository";

export class WorkspaceRepository extends BaseRepository<Workspace> {
  protected readonly tableName = "workspaces";

  // ── Create with sync queue ─────────────────────────────────────────────────

  async createWorkspace(input: CreateWorkspaceInput): Promise<Workspace> {
    const now = this.nowISO();
    const workspace: Workspace = {
      id: this.newId(),
      ...input,
      created_at: now,
      updated_at: now,
    };

    await this.create(workspace);
    await this.enqueueSync("CREATE", "workspace", workspace.id, workspace);
    
    // Seed default categories automatically for the new workspace
    await this.seedDefaultCategories(workspace.id);

    // Seed default settings automatically for the new workspace
    await settingsRepository.upsertSettings(workspace.id, {
      currency: workspace.currency,
      theme: "system",
      locale: "en-US",
      first_day_of_week: 0,
    });
    
    return workspace;
  }

  // ── Query: get default workspace ───────────────────────────────────────────

  async getDefault(): Promise<Workspace | undefined> {
    try {
      return await db.workspaces
        .where("is_default")
        .equals(1 as any)
        .first();
    } catch (err) {
      throw new DatabaseError("Failed to get default workspace", "getDefault", toAppError(err));
    }
  }

  // ── Query: list all workspaces ─────────────────────────────────────────────

  async listAll(): Promise<Workspace[]> {
    try {
      return await this.table.toArray();
    } catch (err) {
      throw new DatabaseError("Failed to list workspaces", "listAll", toAppError(err));
    }
  }

  // ── Seed default categories for workspace ─────────────────────────────────

  async seedDefaultCategories(workspaceId: string): Promise<void> {
    const now = this.nowISO();
    
    const defaultCategories: Omit<Category, "id">[] = [
      // Expense Categories
      { workspace_id: workspaceId, name: "Food", type: "expense", color: "#f87171", icon: "Utensils", sort_order: 1, created_at: now, updated_at: now },
      { workspace_id: workspaceId, name: "Transport", type: "expense", color: "#60a5fa", icon: "Car", sort_order: 2, created_at: now, updated_at: now },
      { workspace_id: workspaceId, name: "Shopping", type: "expense", color: "#fb7185", icon: "ShoppingBag", sort_order: 3, created_at: now, updated_at: now },
      { workspace_id: workspaceId, name: "Rent", type: "expense", color: "#fbbf24", icon: "Home", sort_order: 4, created_at: now, updated_at: now },
      { workspace_id: workspaceId, name: "Utilities", type: "expense", color: "#34d399", icon: "Zap", sort_order: 5, created_at: now, updated_at: now },
      { workspace_id: workspaceId, name: "Leisure", type: "expense", color: "#c084fc", icon: "Coffee", sort_order: 6, created_at: now, updated_at: now },
      
      // Income Categories
      { workspace_id: workspaceId, name: "Salary", type: "income", color: "#34d399", icon: "Briefcase", sort_order: 1, created_at: now, updated_at: now },
      { workspace_id: workspaceId, name: "Freelance", type: "income", color: "#60a5fa", icon: "Laptop", sort_order: 2, created_at: now, updated_at: now },
      { workspace_id: workspaceId, name: "Investment", type: "income", color: "#fbbf24", icon: "TrendingUp", sort_order: 3, created_at: now, updated_at: now },
      { workspace_id: workspaceId, name: "Bonus", type: "income", color: "#a78bfa", icon: "Award", sort_order: 4, created_at: now, updated_at: now },
      { workspace_id: workspaceId, name: "Gift", type: "income", color: "#f472b6", icon: "Gift", sort_order: 5, created_at: now, updated_at: now },
    ];

    try {
      await db.transaction("rw", db.categories, db.sync_queue, async () => {
        // Double check we don't duplicate existing categories
        const existingCount = await db.categories.where("workspace_id").equals(workspaceId).count();
        if (existingCount > 0) return;

        for (const cat of defaultCategories) {
          const category: Category = {
            id: crypto.randomUUID(),
            ...cat,
          };
          await db.categories.add(category);
          await this.enqueueSync("CREATE", "category", category.id, category);
        }
      });
    } catch (err) {
      console.error("[WorkspaceRepository] Failed to seed default categories:", toAppError(err));
      // Do not re-throw so workspace creation doesn't crash completely
    }
  }
}

export const workspaceRepository = new WorkspaceRepository();
