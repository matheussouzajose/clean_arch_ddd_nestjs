import { DeleteCategoryUseCase } from '@core/category/application/use-cases/delete-category/delete-category.use-case';
import { CategoryInMemoryRepository } from '@core/category/infrastructure/persistence/repository/in-memory/category-in-memory.repository';
import {
  InvalidUuidError,
  Uuid,
} from '@core/shared/domain/value-objects/uuid.vo';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { Category } from '@core/category/domain/entity/category.aggregate';

describe('DeleteCategoryUseCase Unit Tests', () => {
  let useCase: DeleteCategoryUseCase;
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new DeleteCategoryUseCase(repository);
  });

  test('should throws error when entity not found', async () => {
    await expect(() => useCase.execute({ id: 'fake id' })).rejects.toThrow(
      new InvalidUuidError(),
    );

    const categoryId = new Uuid();

    await expect(() =>
      useCase.execute({ id: categoryId.value }),
    ).rejects.toThrow(new NotFoundError(categoryId.value));
  });

  test('should delete a category', async () => {
    const items = [Category.create({ name: 'test 1' })];
    repository.items = items;
    await useCase.execute({
      id: items[0].entityId.value,
    });
    expect(repository.items).toHaveLength(0);
  });
});
