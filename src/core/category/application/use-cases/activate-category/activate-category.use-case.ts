import { IUseCase } from '@core/shared/application/use-case.interface';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { Category } from '@core/category/domain/entity/category.entity';
import { UpdateCategoryOutput } from '@core/category/application/use-cases/update-category/update-category.use-case';
import {
  CategoryOutput,
  CategoryOutputMapper,
} from '@core/category/application/use-cases/common/category-output.dto';
import { ICategoryRepository } from '@core/category/domain/repository/category.repository.interface';
import { ActivateCategoryInput } from '@core/category/application/use-cases/activate-category/dto/activate-category-input.dto';

export class ActivateCategoryUseCase
  implements IUseCase<ActivateCategoryInput, UpdateCategoryOutput>
{
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(input: ActivateCategoryInput): Promise<ActivateCategoryOutput> {
    const category = await this.categoryRepository.findById(new Uuid(input.id));
    if (!category) {
      throw new NotFoundError(input.id, Category);
    }
    category.activate();
    await this.categoryRepository.update(category);
    return CategoryOutputMapper.toOutput(category);
  }
}

type ActivateCategoryOutput = CategoryOutput;
