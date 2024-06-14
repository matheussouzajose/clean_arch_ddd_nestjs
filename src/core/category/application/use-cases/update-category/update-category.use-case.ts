import { IUseCase } from '@core/shared/application/use-case.interface';
import { UpdateCategoryInput } from '@core/category/application/use-cases/update-category/dto/update-category-input.dto';
import { ICategoryRepository } from '@core/category/domain/repository/category.repository.interface';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { Category } from '@core/category/domain/entity/category.aggregate';
import { EntityValidationError } from '@core/shared/domain/errors/validation.error';
import {
  CategoryOutput,
  CategoryOutputMapper,
} from '@core/category/application/use-cases/common/category-output.dto';

export class UpdateCategoryUseCase
  implements IUseCase<UpdateCategoryInput, UpdateCategoryOutput>
{
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(input: UpdateCategoryInput): Promise<UpdateCategoryOutput> {
    const category = await this.categoryRepository.findById(new Uuid(input.id));
    if (!category) {
      throw new NotFoundError(input.id, Category);
    }
    input.name && category.changeName(input.name);
    if (input.description !== undefined) {
      category.changeDescription(input.description);
    }
    if (category.notification.hasErrors()) {
      throw new EntityValidationError(category.notification.toJSON());
    }
    await this.categoryRepository.update(category);
    return CategoryOutputMapper.toOutput(category);
  }
}

export type UpdateCategoryOutput = CategoryOutput;
