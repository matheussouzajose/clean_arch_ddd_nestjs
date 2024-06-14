import { DeleteCategoryUseCase } from '@core/category/application/use-cases/delete-category/delete-category.use-case';
import { CategorySequelizeRepository } from '@core/category/infrastructure/persistence/repository/sequelize/category-sequelize.repository';
import { setupSequelize } from '@core/shared/infrastructure/testing/helpers';
import { CategoryModel } from '@core/category/infrastructure/persistence/repository/sequelize/category.model';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { Category } from '@core/category/domain/entity/category.aggregate';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';

describe('DeleteCategoryUseCase Integration Tests', () => {
  let useCase: DeleteCategoryUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new DeleteCategoryUseCase(repository);
  });

  test('should throws error when entity not found', async () => {
    const categoryId = new Uuid().value;
    await expect(() => useCase.execute({ id: categoryId })).rejects.toThrow(
      new NotFoundError(categoryId),
    );
  });

  test('should delete a category', async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);
    await useCase.execute({
      id: category.entityId.value,
    });
    const entityId = category.entityId as Uuid;
    await expect(repository.findById(entityId)).resolves.toBeNull();
  });
});
