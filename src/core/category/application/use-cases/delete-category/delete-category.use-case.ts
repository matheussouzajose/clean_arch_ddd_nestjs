import { IUseCase } from '@core/shared/application/use-case.interface';
import { ICategoryRepository } from '@core/category/domain/repository/category.repository.interface';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { DeleteCategoryInput } from '@core/category/application/use-cases/delete-category/dto/delete-category-input.dto';

export class DeleteCategoryUseCase
  implements IUseCase<DeleteCategoryInput, DeleteCategoryOutput>
{
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(input: DeleteCategoryInput): Promise<DeleteCategoryOutput> {
    const categoryId = new Uuid(input.id);
    await this.categoryRepository.delete(categoryId);
  }
}

type DeleteCategoryOutput = void;
