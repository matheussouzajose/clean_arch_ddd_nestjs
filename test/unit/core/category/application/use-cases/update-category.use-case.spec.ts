import { UpdateCategoryUseCase } from '@core/category/application/use-cases/update-category/update-category.use-case';
import { CategoryInMemoryRepository } from '@core/category/infrastructure/persistence/repository/in-memory/category-in-memory.repository';
import {
  InvalidUuidError,
  Uuid,
} from '@core/shared/domain/value-objects/uuid.vo';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { Category } from '@core/category/domain/entity/category.aggregate';

describe('UpdateCategoryUseCase Unit Tests', () => {
  let useCase: UpdateCategoryUseCase;
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new UpdateCategoryUseCase(repository);
  });

  test('should throws error when entity not found', async () => {
    await expect(() =>
      useCase.execute({ id: 'fake id', name: 'fake' }),
    ).rejects.toThrow(new InvalidUuidError());
    const categoryId = new Uuid();
    await expect(() =>
      useCase.execute({ id: categoryId.value, name: 'fake' }),
    ).rejects.toThrow(new NotFoundError(categoryId.value));
  });

  test('should throw an error when aggregate is not valid', async () => {
    const aggregate = Category.create({ name: 'Movie' });
    repository.items = [aggregate];
    await expect(() =>
      useCase.execute({
        id: aggregate.entityId.value,
        name: 't'.repeat(256),
      }),
    ).rejects.toThrowError('Entity Validation Error');
  });

  test('should update a category', async () => {
    const spyUpdate = jest.spyOn(repository, 'update');
    const entity = Category.create({ name: 'Movie' });
    repository.items = [entity];
    let output = await useCase.execute({
      id: entity.entityId.value,
      name: 'test',
    });
    expect(spyUpdate).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      id: entity.entityId.value,
      name: 'test',
      description: null,
      isActive: true,
      createdAt: entity.getCreatedAt(),
    });
    type Arrange = {
      input: {
        id: string;
        name: string;
        description?: null | string;
        isActive?: boolean;
      };
      expected: {
        id: string;
        name: string;
        description: null | string;
        isActive: boolean;
        createdAt: string;
      };
    };
    const arrange: Arrange[] = [
      {
        input: {
          id: entity.entityId.value,
          name: 'test',
          description: 'some description',
        },
        expected: {
          id: entity.entityId.value,
          name: 'test',
          description: 'some description',
          isActive: true,
          createdAt: entity.getCreatedAt(),
        },
      },
      {
        input: {
          id: entity.entityId.value,
          name: 'test',
        },
        expected: {
          id: entity.entityId.value,
          name: 'test',
          description: 'some description',
          isActive: true,
          createdAt: entity.getCreatedAt(),
        },
      },
      {
        input: {
          id: entity.entityId.value,
          name: 'test',
        },
        expected: {
          id: entity.entityId.value,
          name: 'test',
          description: 'some description',
          isActive: true,
          createdAt: entity.getCreatedAt(),
        },
      },
      {
        input: {
          id: entity.entityId.value,
          name: 'test',
        },
        expected: {
          id: entity.entityId.value,
          name: 'test',
          description: 'some description',
          isActive: true,
          createdAt: entity.getCreatedAt(),
        },
      },
      {
        input: {
          id: entity.entityId.value,
          name: 'test',
        },
        expected: {
          id: entity.entityId.value,
          name: 'test',
          description: 'some description',
          isActive: true,
          createdAt: entity.getCreatedAt(),
        },
      },
      {
        input: {
          id: entity.entityId.value,
          name: 'test',
          description: 'some description',
        },
        expected: {
          id: entity.entityId.value,
          name: 'test',
          description: 'some description',
          isActive: true,
          createdAt: entity.getCreatedAt(),
        },
      },
    ];

    for (const i of arrange) {
      output = await useCase.execute({
        id: i.input.id,
        ...('name' in i.input && { name: i.input.name }),
        ...('description' in i.input && { description: i.input.description }),
      });
      expect(output).toStrictEqual({
        id: entity.entityId.value,
        name: i.expected.name,
        description: i.expected.description,
        isActive: i.expected.isActive,
        createdAt: i.expected.createdAt,
      });
    }
  });
});
