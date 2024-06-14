import { CategoryInMemoryRepository } from '@core/category/infrastructure/persistence/repository/in-memory/category-in-memory.repository';
import {
  InvalidUuidError,
  Uuid,
} from '@core/shared/domain/value-objects/uuid.vo';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { Category } from '@core/category/domain/entity/category.aggregate';
import { ActivateCategoryUseCase } from '@core/category/application/use-cases/activate-category/activate-category.use-case';

describe('ActivateCategoryUseCase Unit Tests', () => {
  let useCase: ActivateCategoryUseCase;
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new ActivateCategoryUseCase(repository);
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

  test('should activate a category', async () => {
    const spyUpdate = jest.spyOn(repository, 'update');
    const entity = Category.create({ name: 'Movie', isActive: false });
    expect(entity.getIsActive()).toBeFalsy();
    repository.items = [entity];
    const output = await useCase.execute({ id: entity.entityId.value });
    expect(spyUpdate).toHaveBeenCalledTimes(1);
    expect(output.isActive).toBeTruthy();
  });
});
