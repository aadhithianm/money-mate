import { db } from "@/db/DexieDB";
import type { Category, CategoryType } from "@/types/entities";
import type { CreateCategoryInput, UpdateCategoryInput } from "@/types/schemas";
import { DatabaseError, toAppError } from "@/types/errors";
import { BaseRepository } from "./BaseRepository";

export class CategoryRepository extends BaseRepository<Category> {
  protected readonly tableName = "categories";

  // ── Create with sync queue ─────────────────────────────────────────────────

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const now = this.nowISO();
    const category: Category = {
      id: this.newId(),
      ...input,
      created_at: now,
      updated_at: now,
    };

    await this.create(category);
    await this.enqueueSync("CREATE", "category", category.id, category);
    return category;
  }

  // ── Update with sync queue ─────────────────────────────────────────────────

  async updateCategory(input: UpdateCategoryInput): Promise<Category> {
    const { id, ...changes } = input;
    const updated = await this.update(id, changes as Partial<Category>);
    const full = await this.findById(id);
    if (full) {
      await this.enqueueSync("UPDATE", "category", id, full);
    }
    return updated;
  }

  // ── Soft delete with sync queue ────────────────────────────────────────────

  async deleteCategory(id: string): Promise<void> {
    await this.softDelete(id);
    await this.enqueueSync("DELETE", "category", id, { id, deleted_at: this.nowISO() });
  }

  // ── Query: list by type for workspace ──────────────────────────────────────

  async listByType(workspaceId: string, type: CategoryType): Promise<Category[]> {
    try {
      return await db.categories
        .where("[workspace_id+type]")
        .equals([workspaceId, type])
        .filter((cat) => !cat.deleted_at)
        .sortBy("sort_order");
    } catch (err) {
      throw new DatabaseError("Failed to list categories by type", "listByType", toAppError(err));
    }
  }
}

export const categoryRepository = new CategoryRepository();
