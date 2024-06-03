import { ListCategoriesUseCase } from '@core/category/application/use-cases/list-categories/list-categories.use-case';
import { CategoryInMemoryRepository } from '@core/category/infrastructure/persistence/repository/in-memory/category-in-memory.repository';
import { CategorySearchResult } from '@core/category/domain/repository/category.repository.interface';
import { Category } from '@core/category/domain/entity/category.entity';
import { CategoryOutputMapper } from '@core/category/application/use-cases/common/category-output.dto';

describe('ListCategoriesUseCase Unit Tests', () => {
  let useCase: ListCategoriesUseCase;
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new ListCategoriesUseCase(repository);
  });

  test('toOutput method', () => {
    let result = new CategorySearchResult({
      items: [],
      total: 1,
      currentPage: 1,
      perPage: 2,
    });
    let output = useCase['toOutput'](result);
    expect(output).toStrictEqual({
      items: [],
      total: 1,
      currentPage: 1,
      perPage: 2,
      lastPage: 1,
    });

    const entity = Category.create({ name: 'Movie' });
    result = new CategorySearchResult({
      items: [entity],
      total: 1,
      currentPage: 1,
      perPage: 2,
    });

    output = useCase['toOutput'](result);
    expect(output).toStrictEqual({
      items: [entity].map(CategoryOutputMapper.toOutput),
      total: 1,
      currentPage: 1,
      perPage: 2,
      lastPage: 1,
    });
  });

  test.skip('should return output sorted by createdAt when input param is empty', async () => {
    const items = [
      Category.fake()
        .aCategory()
        .withName('test 1')
        .withCreatedAt(new Date())
        .build(),
      Category.fake()
        .aCategory()
        .withName('test 2')
        .withCreatedAt(new Date())
        .build(),
    ];

    repository.items = items;
    const output = await useCase.execute({});
    expect(output).toStrictEqual({
      items: [...items].reverse().map(CategoryOutputMapper.toOutput),
      total: 2,
      currentPage: 1,
      perPage: 15,
      lastPage: 1,
    });
  });

  test('should return output using pagination, sort and filter', async () => {
    const items = [
      Category.create({ name: 'a' }),
      Category.create({ name: 'AAA' }),
      Category.create({ name: 'AaA' }),
      Category.create({ name: 'b' }),
      Category.create({ name: 'c' }),
    ];
    repository.items = items;

    let output = await useCase.execute({
      page: 1,
      perPage: 2,
      sort: 'name',
      filter: 'a',
    });
    expect(output).toStrictEqual({
      items: [items[1], items[2]].map(CategoryOutputMapper.toOutput),
      total: 3,
      currentPage: 1,
      perPage: 2,
      lastPage: 2,
    });

    output = await useCase.execute({
      page: 2,
      perPage: 2,
      sort: 'name',
      filter: 'a',
    });
    expect(output).toStrictEqual({
      items: [items[0]].map(CategoryOutputMapper.toOutput),
      total: 3,
      currentPage: 2,
      perPage: 2,
      lastPage: 2,
    });

    output = await useCase.execute({
      page: 1,
      perPage: 2,
      sort: 'name',
      sortDir: 'desc',
      filter: 'a',
    });
    expect(output).toStrictEqual({
      items: [items[0], items[2]].map(CategoryOutputMapper.toOutput),
      total: 3,
      currentPage: 1,
      perPage: 2,
      lastPage: 2,
    });
  });
});
