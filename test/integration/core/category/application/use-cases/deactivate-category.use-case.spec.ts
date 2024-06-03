import { CategorySequelizeRepository } from '@core/category/infrastructure/persistence/repository/sequelize/category-sequelize.repository';
import { setupSequelize } from '@core/shared/infrastructure/testing/helpers';
import { CategoryModel } from '@core/category/infrastructure/persistence/repository/sequelize/category.model';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { Category } from '@core/category/domain/entity/category.entity';
import { DeactivateCategoryUseCase } from '@core/category/application/use-cases/deactivate-category/deactivate-category.use-case';

describe('DeactivateUseCase Integration Tests', () => {
  let useCase: DeactivateCategoryUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new DeactivateCategoryUseCase(repository);
  });

  test('should throws error when entity not found', async () => {
    const categoryId = new Uuid().value;
    await expect(() => useCase.execute({ id: categoryId })).rejects.toThrow(
      new NotFoundError(categoryId, Category),
    );
  });

  test('should deactivate a category', async () => {
    const entity = Category.fake()
      .aCategory()
      .withCreatedAt(new Date())
      .build();
    expect(entity.getIsActive()).toBeTruthy();
    await repository.insert(entity);
    const output = await useCase.execute({ id: entity.getCategoryId() });
    expect(output.isActive).toBeFalsy();
  });
});
