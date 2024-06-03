import { CategorySequelizeRepository } from '@core/category/infrastructure/persistence/repository/sequelize/category-sequelize.repository';
import { CategoryModel } from '@core/category/infrastructure/persistence/repository/sequelize/category.model';
import { Category } from '@core/category/domain/entity/category.entity';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import {
  CategorySearchParams,
  CategorySearchResult,
} from '@core/category/domain/repository/category.repository.interface';
import { CategoryModelMapper } from '@core/category/infrastructure/persistence/repository/sequelize/category-model-mapper';
import { setupSequelize } from '@core/shared/infrastructure/testing/helpers';

describe('CategorySequelizeRepository Integration Test', () => {
  let repository: CategorySequelizeRepository;
  setupSequelize({ models: [CategoryModel] });

  beforeEach(async () => {
    repository = new CategorySequelizeRepository(CategoryModel);
  });

  test('should inserts a new entity', async () => {
    const entity = Category.fake()
      .aCategory()
      .withCreatedAt(new Date())
      .build();
    await repository.insert(entity);
    const categoryCreated = await repository.findById(entity.entityId as Uuid);
    expect(categoryCreated!.toJSON()).toStrictEqual(entity.toJSON());
  });

  test('should finds a entity by id', async () => {
    let entityFound = await repository.findById(new Uuid());
    expect(entityFound).toBeNull();
    const entity = Category.fake()
      .aCategory()
      .withCreatedAt(new Date())
      .build();
    await repository.insert(entity);
    entityFound = await repository.findById(entity.entityId as Uuid);
    expect(entity.toJSON()).toStrictEqual(entityFound!.toJSON());
  });

  test('should return all categories-module', async () => {
    const entity = Category.fake()
      .aCategory()
      .withCreatedAt(new Date())
      .build();
    await repository.insert(entity);
    const entities = await repository.findAll();
    expect(entities).toHaveLength(1);
    expect(JSON.stringify(entities)).toBe(JSON.stringify([entity]));
  });

  test('should throw error on update when a entity not found', async () => {
    const entity = Category.fake()
      .aCategory()
      .withCreatedAt(new Date())
      .build();
    await expect(repository.update(entity)).rejects.toThrow(
      new NotFoundError(entity.getCategoryId(), Category),
    );
  });

  test('should update a entity', async () => {
    const entity = Category.fake()
      .aCategory()
      .withCreatedAt(new Date())
      .build();
    await repository.insert(entity);
    entity.changeName('Movie updated');
    await repository.update(entity);
    const entityFound = await repository.findById(entity.entityId as Uuid);
    expect(entity.toJSON()).toStrictEqual(entityFound!.toJSON());
  });

  test('should throw error on delete when a entity not found', async () => {
    const categoryId = new Uuid();
    await expect(repository.delete(categoryId)).rejects.toThrow(
      new NotFoundError(categoryId.value, Category),
    );
  });

  test('should delete a entity', async () => {
    const entity = Category.create({ name: 'Movie' });
    await repository.insert(entity);
    const id = entity.entityId as Uuid;
    await repository.delete(id);
    await expect(repository.findById(id)).resolves.toBeNull();
  });

  describe('search method tests', () => {
    test('should only apply paginate when other params are null', async () => {
      const created_at = new Date();
      const categories = Category.fake()
        .theCategories(16)
        .withName('Movie')
        .withDescription(null)
        .withCreatedAt(created_at)
        .build();

      await repository.bulkInsert(categories);
      const spyToEntity = jest.spyOn(CategoryModelMapper, 'toEntity');
      const searchOutput = await repository.search(new CategorySearchParams());
      expect(searchOutput).toBeInstanceOf(CategorySearchResult);
      expect(spyToEntity).toHaveBeenCalledTimes(15);
      expect(searchOutput.toJSON()).toMatchObject({
        total: 16,
        currentPage: 1,
        lastPage: 2,
        perPage: 15,
      });
      searchOutput.items.forEach((item) => {
        expect(item).toBeInstanceOf(Category);
        expect(item.getCategoryId()).toBeDefined();
      });
      const items = searchOutput.items.map((item) => item.toJSON());
      expect(items).toMatchObject(
        new Array(15).fill({
          name: 'Movie',
          description: null,
          isActive: true,
          createdAt: created_at,
        }),
      );
    });

    test('should order by created_at DESC when search params are null', async () => {
      const created_at = new Date();
      const categories = Category.fake()
        .theCategories(16)
        .withName((index) => `Movie ${index}`)
        .withDescription(null)
        .withCreatedAt((index) => new Date(created_at.getTime() + index))
        .build();
      const searchOutput = await repository.search(new CategorySearchParams());
      const items = searchOutput.items;
      [...items].reverse().forEach((item, index) => {
        expect(`Movie ${index}`).toBe(`${categories[index + 1].getName()}`);
      });
    });

    test('should apply paginate and filter', async () => {
      const categories = [
        Category.fake()
          .aCategory()
          .withName('test')
          .withCreatedAt(new Date(new Date().getTime() + 5000))
          .build(),
        Category.fake()
          .aCategory()
          .withName('a')
          .withCreatedAt(new Date(new Date().getTime() + 4000))
          .build(),
        Category.fake()
          .aCategory()
          .withName('TEST')
          .withCreatedAt(new Date(new Date().getTime() + 3000))
          .build(),
        Category.fake()
          .aCategory()
          .withName('TeSt')
          .withCreatedAt(new Date(new Date().getTime() + 1000))
          .build(),
      ];

      await repository.bulkInsert(categories);

      let searchOutput = await repository.search(
        new CategorySearchParams({
          page: 1,
          perPage: 2,
          filter: 'TEST',
        }),
      );
      expect(searchOutput.toJSON(true)).toMatchObject(
        new CategorySearchResult({
          items: [categories[0], categories[2]],
          total: 3,
          currentPage: 1,
          perPage: 2,
        }).toJSON(true),
      );

      searchOutput = await repository.search(
        new CategorySearchParams({
          page: 2,
          perPage: 2,
          filter: 'TEST',
        }),
      );
      expect(searchOutput.toJSON(true)).toMatchObject(
        new CategorySearchResult({
          items: [categories[3]],
          total: 3,
          currentPage: 2,
          perPage: 2,
        }).toJSON(true),
      );
    });

    test('should apply paginate and sort', async () => {
      expect(repository.sortableFields).toStrictEqual(['name', 'createdAt']);
      const categories = [
        Category.fake()
          .aCategory()
          .withName('b')
          .withCreatedAt(new Date())
          .build(),
        Category.fake()
          .aCategory()
          .withName('a')
          .withCreatedAt(new Date())
          .build(),
        Category.fake()
          .aCategory()
          .withName('d')
          .withCreatedAt(new Date())
          .build(),
        Category.fake()
          .aCategory()
          .withName('e')
          .withCreatedAt(new Date())
          .build(),
        Category.fake()
          .aCategory()
          .withName('c')
          .withCreatedAt(new Date())
          .build(),
      ];
      await repository.bulkInsert(categories);

      const arrange = [
        {
          params: new CategorySearchParams({
            page: 1,
            perPage: 2,
            sort: 'name',
          }),
          result: new CategorySearchResult({
            items: [categories[1], categories[0]],
            total: 5,
            currentPage: 1,
            perPage: 2,
          }),
        },
        {
          params: new CategorySearchParams({
            page: 2,
            perPage: 2,
            sort: 'name',
          }),
          result: new CategorySearchResult({
            items: [categories[4], categories[2]],
            total: 5,
            currentPage: 2,
            perPage: 2,
          }),
        },
        {
          params: new CategorySearchParams({
            page: 1,
            perPage: 2,
            sort: 'name',
            sortDir: 'desc',
          }),
          result: new CategorySearchResult({
            items: [categories[3], categories[2]],
            total: 5,
            currentPage: 1,
            perPage: 2,
          }),
        },
        {
          params: new CategorySearchParams({
            page: 2,
            perPage: 2,
            sort: 'name',
            sortDir: 'desc',
          }),
          result: new CategorySearchResult({
            items: [categories[4], categories[0]],
            total: 5,
            currentPage: 2,
            perPage: 2,
          }),
        },
      ];

      for (const i of arrange) {
        const result = await repository.search(i.params);
        expect(result.toJSON(true)).toMatchObject(i.result.toJSON(true));
      }
    });

    describe('should search using filter, sort and paginate', () => {
      const categories = [
        Category.fake()
          .aCategory()
          .withName('test')
          .withCreatedAt(new Date())
          .build(),
        Category.fake()
          .aCategory()
          .withName('a')
          .withCreatedAt(new Date())
          .build(),
        Category.fake()
          .aCategory()
          .withName('TEST')
          .withCreatedAt(new Date())
          .build(),
        Category.fake()
          .aCategory()
          .withName('e')
          .withCreatedAt(new Date())
          .build(),
        Category.fake()
          .aCategory()
          .withName('TeSt')
          .withCreatedAt(new Date())
          .build(),
      ];

      const arrange = [
        {
          search_params: new CategorySearchParams({
            page: 1,
            perPage: 2,
            sort: 'name',
            filter: 'TEST',
          }),
          search_result: new CategorySearchResult({
            items: [categories[2], categories[4]],
            total: 3,
            currentPage: 1,
            perPage: 2,
          }),
        },
        {
          search_params: new CategorySearchParams({
            page: 2,
            perPage: 2,
            sort: 'name',
            filter: 'TEST',
          }),
          search_result: new CategorySearchResult({
            items: [categories[0]],
            total: 3,
            currentPage: 2,
            perPage: 2,
          }),
        },
      ];

      beforeEach(async () => {
        await repository.bulkInsert(categories);
      });

      test.each(arrange)(
        'when value is $search_params',
        async ({ search_params, search_result }) => {
          const result = await repository.search(search_params);
          expect(result.toJSON(true)).toMatchObject(search_result.toJSON(true));
        },
      );
    });
  });
});
