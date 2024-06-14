import { CategorySequelizeRepository } from '@core/category/infrastructure/persistence/repository/sequelize/category-sequelize.repository';
import { setupSequelize } from '@core/shared/infrastructure/testing/helpers';
import { CategoryModel } from '@core/category/infrastructure/persistence/repository/sequelize/category.model';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { Category } from '@core/category/domain/entity/category.aggregate';
import { ActivateCategoryUseCase } from '@core/category/application/use-cases/activate-category/activate-category.use-case';

describe('ActivateUseCase Integration Tests', () => {
  let useCase: ActivateCategoryUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new ActivateCategoryUseCase(repository);
  });

  test('should throws error when entity not found', async () => {
    const categoryId = new Uuid().value;
    await expect(() => useCase.execute({ id: categoryId })).rejects.toThrow(
      new NotFoundError(categoryId),
    );
  });

  test('should activate a category', async () => {
    const entity = Category.fake()
      .aCategory()
      .deactivate()
      .withCreatedAt(new Date())
      .build();
    expect(entity.getIsActive()).toBeFalsy();
    await repository.insert(entity);
    const output = await useCase.execute({ id: entity.entityId.value });
    expect(output.isActive).toBeTruthy();
  });
});
