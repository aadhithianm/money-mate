import { categoryRepository } from "@/repositories/CategoryRepository";
import {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "@/types/schemas";
import { ValidationError } from "@/types/errors";
import { syncQueue } from "@/sync/SyncQueue";
import type { Category } from "@/types/entities";

export class CategoryService {
  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const result = createCategorySchema.safeParse(input);
    if (!result.success) {
      throw new ValidationError("Invalid category fields", result.error.format());
    }

    const category = await categoryRepository.createCategory(result.data);
    syncQueue.triggerSync();
    return category;
  }

  async updateCategory(input: UpdateCategoryInput): Promise<Category> {
    const result = updateCategorySchema.safeParse(input);
    if (!result.success) {
      throw new ValidationError("Invalid category update fields", result.error.format());
    }

    const category = await categoryRepository.updateCategory(result.data);
    syncQueue.triggerSync();
    return category;
  }

  async deleteCategory(id: string): Promise<void> {
    await categoryRepository.deleteCategory(id);
    syncQueue.triggerSync();
  }
}

export const categoryService = new CategoryService();
