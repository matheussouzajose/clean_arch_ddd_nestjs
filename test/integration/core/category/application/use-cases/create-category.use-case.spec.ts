import { CreateCategoryUseCase } from '@core/category/application/use-cases/create-category/create-category.use-case';
import { CategorySequelizeRepository } from '@core/category/infrastructure/persistence/repository/sequelize/category-sequelize.repository';
import { setupSequelize } from '@core/shared/infrastructure/testing/helpers';
import { CategoryModel } from '@core/category/infrastructure/persistence/repository/sequelize/category.model';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';

describe('CreateCategoryUseCase Integration Tests', () => {
  let useCase: CreateCategoryUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new CreateCategoryUseCase(repository);
  });

  test('should create a category', async () => {
    let output = await useCase.execute({ name: 'test' });
    let entity = await repository.findById(new Uuid(output.id));
    expect(output).toStrictEqual({
      id: entity!.entityId.value,
      name: 'test',
      description: null,
      isActive: true,
      createdAt: entity!.getCreatedAt(),
    });
    output = await useCase.execute({
      name: 'test',
      description: 'some description',
    });
    entity = await repository.findById(new Uuid(output.id));
    expect(output).toStrictEqual({
      id: entity!.entityId.value,
      name: 'test',
      description: 'some description',
      isActive: true,
      createdAt: entity!.getCreatedAt(),
    });

    output = await useCase.execute({
      name: 'test',
      description: 'some description',
      isActive: true,
    });
    entity = await repository.findById(new Uuid(output.id));
    expect(output).toStrictEqual({
      id: entity!.entityId.value,
      name: 'test',
      description: 'some description',
      isActive: true,
      createdAt: entity!.getCreatedAt(),
    });

    output = await useCase.execute({
      name: 'test',
      description: 'some description',
      isActive: false,
    });
    entity = await repository.findById(new Uuid(output.id));
    expect(output).toStrictEqual({
      id: entity!.entityId.value,
      name: 'test',
      description: 'some description',
      isActive: false,
      createdAt: entity!.getCreatedAt(),
    });
  });
});
