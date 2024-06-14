import { CategoryInMemoryRepository } from '@core/category/infrastructure/persistence/repository/in-memory/category-in-memory.repository';
import {
  InvalidUuidError,
  Uuid,
} from '@core/shared/domain/value-objects/uuid.vo';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { Category } from '@core/category/domain/entity/category.aggregate';
import { DeactivateCategoryUseCase } from '@core/category/application/use-cases/deactivate-category/deactivate-category.use-case';

describe('DeactivateCategoryUseCase Unit Tests', () => {
  let useCase: DeactivateCategoryUseCase;
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new DeactivateCategoryUseCase(repository);
  });

  test('should throws error when entity not found', async () => {
    await expect(() => useCase.execute({ id: 'fake id' })).rejects.toThrow(
      new InvalidUuidError(),
    );
    const categoryId = new Uuid().value;
    await expect(() => useCase.execute({ id: categoryId })).rejects.toThrow(
      new NotFoundError(categoryId),
    );
  });

  test('should deactivate a category', async () => {
    const spyUpdate = jest.spyOn(repository, 'update');
    const entity = Category.create({ name: 'Movie' });
    expect(entity.getIsActive()).toBeTruthy();
    repository.items = [entity];
    const output = await useCase.execute({ id: entity.entityId.value });
    expect(spyUpdate).toHaveBeenCalledTimes(1);
    expect(output.isActive).toBeFalsy();
  });
});
