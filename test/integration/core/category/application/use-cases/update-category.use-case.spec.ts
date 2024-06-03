import { UpdateCategoryUseCase } from '@core/category/application/use-cases/update-category/update-category.use-case';
import { CategorySequelizeRepository } from '@core/category/infrastructure/persistence/repository/sequelize/category-sequelize.repository';
import { setupSequelize } from '@core/shared/infrastructure/testing/helpers';
import { CategoryModel } from '@core/category/infrastructure/persistence/repository/sequelize/category.model';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { Category } from '@core/category/domain/entity/category.entity';

describe('UpdateCategoryUseCase Integration Tests', () => {
  let useCase: UpdateCategoryUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new UpdateCategoryUseCase(repository);
  });

  test('should throws error when entity not found', async () => {
    const categoryId = new Uuid();
    await expect(() =>
      useCase.execute({ id: categoryId.value, name: 'fake' }),
    ).rejects.toThrow(new NotFoundError(categoryId.value, Category));
  });

  test('should update a category', async () => {
    const entity = Category.fake()
      .aCategory()
      .withCreatedAt(new Date())
      .build();
    await repository.insert(entity);
    let output = await useCase.execute({
      id: entity.getCategoryId(),
      name: 'test',
    });
    expect(output).toStrictEqual({
      id: entity.getCategoryId(),
      name: 'test',
      description: entity.getDescription(),
      isActive: true,
      createdAt: entity.getCreatedAt(),
    });

    type Arrange = {
      input: {
        id: string;
        name: string;
        description?: null | string;
      };
      expected: {
        id: string;
        name: string;
        description: null | string;
        isActive: boolean;
        createdAt: Date;
      };
    };
    const arrange: Arrange[] = [
      {
        input: {
          id: entity.getCategoryId(),
          name: 'test',
          description: 'some description',
        },
        expected: {
          id: entity.getCategoryId(),
          name: 'test',
          description: 'some description',
          isActive: true,
          createdAt: entity.getCreatedAt(),
        },
      },
      {
        input: {
          id: entity.getCategoryId(),
          name: 'test',
        },
        expected: {
          id: entity.getCategoryId(),
          name: 'test',
          description: 'some description',
          isActive: true,
          createdAt: entity.getCreatedAt(),
        },
      },
      {
        input: {
          id: entity.getCategoryId(),
          name: 'test',
        },
        expected: {
          id: entity.getCategoryId(),
          name: 'test',
          description: 'some description',
          isActive: true,
          createdAt: entity.getCreatedAt(),
        },
      },
      {
        input: {
          id: entity.getCategoryId(),
          name: 'test',
        },
        expected: {
          id: entity.getCategoryId(),
          name: 'test',
          description: 'some description',
          isActive: true,
          createdAt: entity.getCreatedAt(),
        },
      },
      {
        input: {
          id: entity.getCategoryId(),
          name: 'test',
        },
        expected: {
          id: entity.getCategoryId(),
          name: 'test',
          description: 'some description',
          isActive: true,
          createdAt: entity.getCreatedAt(),
        },
      },
      {
        input: {
          id: entity.getCategoryId(),
          name: 'test',
          description: null,
        },
        expected: {
          id: entity.getCategoryId(),
          name: 'test',
          description: null,
          isActive: true,
          createdAt: entity.getCreatedAt(),
        },
      },
    ];

    for (const i of arrange) {
      output = await useCase.execute({
        id: i.input.id,
        ...(i.input.name && { name: i.input.name }),
        ...('description' in i.input && { description: i.input.description }),
      });
      const entityUpdated = await repository.findById(new Uuid(i.input.id));
      expect(output).toStrictEqual({
        id: entity.getCategoryId(),
        name: i.expected.name,
        description: i.expected.description,
        isActive: i.expected.isActive,
        createdAt: entityUpdated!.getCreatedAt(),
      });
      expect(entityUpdated!.toJSON()).toStrictEqual({
        categoryId: entity.getCategoryId(),
        name: i.expected.name,
        description: i.expected.description,
        isActive: i.expected.isActive,
        createdAt: entityUpdated!.getCreatedAt(),
      });
    }
  });
});
