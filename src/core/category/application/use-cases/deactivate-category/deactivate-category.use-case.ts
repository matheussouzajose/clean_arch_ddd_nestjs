import { IUseCase } from '@core/shared/application/use-case.interface';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { Category } from '@core/category/domain/entity/category.entity';
import {
  CategoryOutput,
  CategoryOutputMapper,
} from '@core/category/application/use-cases/common/category-output.dto';
import { ICategoryRepository } from '@core/category/domain/repository/category.repository.interface';
import { DeactivateCategoryInput } from '@core/category/application/use-cases/deactivate-category/dto/deactivate-category-input.dto';

export class DeactivateCategoryUseCase
  implements IUseCase<DeactivateCategoryInput, DeactivateCategoryOutput>
{
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(
    input: DeactivateCategoryInput,
  ): Promise<DeactivateCategoryOutput> {
    const category = await this.categoryRepository.findById(new Uuid(input.id));
    if (!category) {
      throw new NotFoundError(input.id, Category);
    }
    category.deactivate();
    await this.categoryRepository.update(category);
    return CategoryOutputMapper.toOutput(category);
  }
}

type DeactivateCategoryOutput = CategoryOutput;
