import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from '../categories.controller';
import { ConfigModule } from '../../config-module/config.module';
import { DatabaseModule } from '../../database-module/database.module';
import { CategoriesModule } from '../categories.module';
import { CATEGORY_PROVIDERS } from '../categories.providers';

import {
  CategoryCollectionPresenter,
  CategoryPresenter,
} from '../categories.presenter';
import { ICategoryRepository } from '@core/category/domain/repository/category.repository.interface';
import { CreateCategoryUseCase } from '@core/category/application/use-cases/create-category/create-category.use-case';
import { UpdateCategoryUseCase } from '@core/category/application/use-cases/update-category/update-category.use-case';
import { ListCategoriesUseCase } from '@core/category/application/use-cases/list-categories/list-categories.use-case';
import { GetCategoryUseCase } from '@core/category/application/use-cases/get-category/get-category.use-case';
import { DeleteCategoryUseCase } from '@core/category/application/use-cases/delete-category/delete-category.use-case';
import { CategoryOutputMapper } from '@core/category/application/use-cases/common/category-output.dto';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { Category } from '@core/category/domain/entity/category.aggregate';
import {
  CreateCategoryFixture,
  ListCategoriesFixture,
  UpdateCategoryFixture,
} from '../testing/category-fixture';
import { ActivateCategoryUseCase } from '@core/category/application/use-cases/activate-category/activate-category.use-case';
import { DeactivateCategoryUseCase } from '@core/category/application/use-cases/deactivate-category/deactivate-category.use-case';

describe('CategoriesController Integration Tests', () => {
  let controller: CategoriesController;
  let repository: ICategoryRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        DatabaseModule,
        // AuthModule,
        CategoriesModule,
      ],
    }).compile();
    controller = module.get<CategoriesController>(CategoriesController);
    repository = module.get<ICategoryRepository>(
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );
  });

  test('should be defined', () => {
    expect(controller).toBeDefined();
    expect(controller['createUseCase']).toBeInstanceOf(CreateCategoryUseCase);
    expect(controller['updateUseCase']).toBeInstanceOf(UpdateCategoryUseCase);
    expect(controller['listUseCase']).toBeInstanceOf(ListCategoriesUseCase);
    expect(controller['getUseCase']).toBeInstanceOf(GetCategoryUseCase);
    expect(controller['deleteUseCase']).toBeInstanceOf(DeleteCategoryUseCase);
    expect(controller['activateUseCase']).toBeInstanceOf(
      ActivateCategoryUseCase,
    );
    expect(controller['deactivateUseCase']).toBeInstanceOf(
      DeactivateCategoryUseCase,
    );
  });

  describe('should create a category', () => {
    const arrange = CreateCategoryFixture.arrangeForCreate();
    test.each(arrange)(
      'when body is $send_data',
      async ({ send_data, expected }) => {
        const presenter = await controller.create(send_data);
        const entity = await repository.findById(new Uuid(presenter.id));
        expect(entity!.toJSON()).toStrictEqual({
          categoryId: presenter.id,
          createdAt: presenter.createdAt,
          ...expected,
        });
        const output = CategoryOutputMapper.toOutput(entity!);
        expect(presenter).toEqual(new CategoryPresenter(output));
      },
    );
  });

  describe('should update a category', () => {
    const arrange = UpdateCategoryFixture.arrangeForUpdate();

    const category = Category.fake()
      .aCategory()
      .withCreatedAt(new Date())
      .build();

    beforeEach(async () => {
      await repository.insert(category);
    });

    test.each(arrange)(
      'when body is $send_data',
      async ({ send_data, expected }) => {
        const presenter = await controller.update(
          category.getCategoryId(),
          send_data,
        );
        const entity = await repository.findById(new Uuid(presenter.id));
        expect(entity!.toJSON()).toStrictEqual({
          categoryId: presenter.id,
          createdAt: presenter.createdAt,
          name: expected.name ?? category.getName(),
          description:
            'description' in expected
              ? expected.description
              : category.getDescription(),
          isActive: category.getIsActive(),
        });
        const output = CategoryOutputMapper.toOutput(entity!);
        expect(presenter).toEqual(new CategoryPresenter(output));
      },
    );
  });

  test('should delete a category', async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);
    const response = await controller.remove(category.getCategoryId());
    expect(response).not.toBeDefined();
    const entityId = category.entityId as Uuid;
    await expect(repository.findById(entityId)).resolves.toBeNull();
  });

  test('should get a category', async () => {
    const category = Category.fake()
      .aCategory()
      .withCreatedAt(new Date())
      .build();
    await repository.insert(category);
    const presenter = await controller.findOne(category.getCategoryId());

    expect(presenter.id).toBe(category.getCategoryId());
    expect(presenter.name).toBe(category.getName());
    expect(presenter.description).toBe(category.getDescription());
    expect(presenter.isActive).toBe(category.getIsActive());
    expect(presenter.createdAt).toStrictEqual(category.getCreatedAt());
  });

  describe('search method', () => {
    describe('should sorted categories by createdAt', () => {
      const { entitiesMap, arrange } =
        ListCategoriesFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        await repository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when send_data is $send_data',
        async ({ send_data, expected }) => {
          const presenter = await controller.search(send_data);
          const { entities, ...paginationProps } = expected;
          expect(presenter).toEqual(
            new CategoryCollectionPresenter({
              items: entities.map(CategoryOutputMapper.toOutput),
              ...paginationProps.meta,
            }),
          );
        },
      );
    });

    describe('should return categories using pagination, sort and filter', () => {
      const { entitiesMap, arrange } = ListCategoriesFixture.arrangeUnsorted();

      beforeEach(async () => {
        await repository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when send_data is $send_data',
        async ({ send_data, expected }) => {
          const presenter = await controller.search(send_data);
          const { entities, ...paginationProps } = expected;
          expect(presenter).toEqual(
            new CategoryCollectionPresenter({
              items: entities.map(CategoryOutputMapper.toOutput),
              ...paginationProps.meta,
            }),
          );
        },
      );
    });
  });

  test('should activate a category', async () => {
    const category = Category.fake()
      .aCategory()
      .withCreatedAt(new Date())
      .build();
    await repository.insert(category);
    const presenter = await controller.activate(category.getCategoryId());
    expect(presenter.isActive).toBeTruthy();
  });

  test('should deactivate a category', async () => {
    const category = Category.fake()
      .aCategory()
      .withCreatedAt(new Date())
      .build();
    await repository.insert(category);
    const presenter = await controller.deactivate(category.getCategoryId());
    expect(presenter.isActive).toBeFalsy();
  });
});
