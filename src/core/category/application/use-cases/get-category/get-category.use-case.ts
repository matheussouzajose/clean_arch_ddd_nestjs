import { IUseCase } from '@core/shared/application/use-case.interface';
import { ICategoryRepository } from '@core/category/domain/repository/category.repository.interface';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { Category } from '@core/category/domain/entity/category.entity';
import {
  CategoryOutput,
  CategoryOutputMapper,
} from '@core/category/application/use-cases/common/category-output.dto';
import { GetCategoryInput } from '@core/category/application/use-cases/get-category/dto/get-category-input.dto';

export class GetCategoryUseCase
  implements IUseCase<GetCategoryInput, GetCategoryOutput>
{
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(input: GetCategoryInput): Promise<GetCategoryOutput> {
    const categoryId = new Uuid(input.id);
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new NotFoundError(input.id, Category);
    }
    return CategoryOutputMapper.toOutput(category);
  }
}

export type GetCategoryOutput = CategoryOutput;
