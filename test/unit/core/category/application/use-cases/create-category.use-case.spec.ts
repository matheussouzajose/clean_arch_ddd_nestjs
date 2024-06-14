import { CreateCategoryUseCase } from '@core/category/application/use-cases/create-category/create-category.use-case';
import { CategoryInMemoryRepository } from '@core/category/infrastructure/persistence/repository/in-memory/category-in-memory.repository';

describe('CreateCategoryUseCase Unit Tests', () => {
  let useCase: CreateCategoryUseCase;
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new CreateCategoryUseCase(repository);
  });

  test('should throw an error when aggregate is not valid', async () => {
    const input = { name: 't'.repeat(256) };
    await expect(() => useCase.execute(input)).rejects.toThrowError(
      'Entity Validation Error',
    );
  });

  test('should create a category', async () => {
    const spyInsert = jest.spyOn(repository, 'insert');
    let output = await useCase.execute({
      name: 'test',
    });
    expect(spyInsert).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      id: repository.items[0].entityId.value,
      name: 'test',
      description: null,
      isActive: true,
      createdAt: repository.items[0].getCreatedAt(),
    });
    output = await useCase.execute({
      name: 'test',
      description: 'some description',
      isActive: false,
    });
    expect(spyInsert).toHaveBeenCalledTimes(2);
    expect(output).toStrictEqual({
      id: repository.items[1].entityId.value,
      name: 'test',
      description: 'some description',
      isActive: false,
      createdAt: repository.items[1].getCreatedAt(),
    });
  });
});
