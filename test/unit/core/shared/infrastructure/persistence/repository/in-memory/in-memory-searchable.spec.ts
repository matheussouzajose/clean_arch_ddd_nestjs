import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { Entity } from '@core/shared/domain/entity/entity';
import { InMemorySearchableRepository } from '@core/shared/infrastructure/persistence/repository/in-memory/in-memory-searchable.repository';
import { SearchParams } from '@core/shared/domain/repository/search-params';
import { SearchResult } from '@core/shared/domain/repository/search-result';
import { ValueObject } from '@core/shared/domain/value-objects/value-object';

type StubEntityConstructor = {
  stubId?: StubId;
  name: string;
  price: number;
};

type StubEntityCommandCreate = Omit<StubEntityConstructor, 'stubId'>;

class StubId extends Uuid {}

class StubEntity extends Entity {
  stubId: StubId;
  name: string;
  price: number;

  private constructor(props: StubEntityConstructor) {
    super();
    this.stubId = props.stubId || new StubId();
    this.name = props.name;
    this.price = props.price;
  }

  static create(input: StubEntityCommandCreate) {
    return new StubEntity({
      ...input,
      stubId: new StubId(),
    });
  }

  get entityId(): ValueObject {
    return this.stubId;
  }

  toJSON() {
    return {
      stubId: this.stubId.value,
      name: this.name,
      price: this.price,
    };
  }
}

class StubInMemorySearchableRepository extends InMemorySearchableRepository<
  StubEntity,
  Uuid
> {
  sortableFields: string[] = ['name'];

  protected async applyFilter(
    items: StubEntity[],
    filter: string | null,
  ): Promise<StubEntity[]> {
    if (!filter) {
      return items;
    }
    return items.filter((i) => {
      return (
        i.name.toLowerCase().includes(filter.toLowerCase()) ||
        i.price.toString() === filter
      );
    });
  }
}

describe('InMemorySearchableRepository Unit Tests', () => {
  let repository: StubInMemorySearchableRepository;

  beforeEach(() => (repository = new StubInMemorySearchableRepository()));

  describe('ApplyFilter method', () => {
    test('Should no filter items when filter param is null', async () => {
      const items = [StubEntity.create({ name: 'name value', price: 5 })];
      const spyFilterMethod = jest.spyOn(items, 'filter' as any);
      const itemsFiltered = await repository['applyFilter'](items, null);
      expect(itemsFiltered).toStrictEqual(items);
      expect(spyFilterMethod).not.toHaveBeenCalled();
    });

    test('Should filter using a filter param', async () => {
      const items = [
        StubEntity.create({ name: 'test', price: 5 }),
        StubEntity.create({ name: 'TEST', price: 5 }),
        StubEntity.create({ name: 'fake', price: 0 }),
      ];
      const spyFilterMethod = jest.spyOn(items, 'filter' as any);
      let itemsFiltered = await repository['applyFilter'](items, 'TEST');
      expect(itemsFiltered).toStrictEqual([items[0], items[1]]);
      expect(spyFilterMethod).toHaveBeenCalledTimes(1);
      itemsFiltered = await repository['applyFilter'](items, '5');
      expect(itemsFiltered).toStrictEqual([items[0], items[1]]);
      expect(spyFilterMethod).toHaveBeenCalledTimes(2);
      itemsFiltered = await repository['applyFilter'](items, 'no-filter');
      expect(itemsFiltered).toHaveLength(0);
      expect(spyFilterMethod).toHaveBeenCalledTimes(3);
    });
  });

  describe('applySort method', () => {
    test('Should no sort items', async () => {
      const items = [
        StubEntity.create({ name: 'b', price: 5 }),
        StubEntity.create({ name: 'a', price: 5 }),
      ];
      let itemsSorted = repository['applySort'](items, null, null);
      expect(itemsSorted).toStrictEqual(items);
      itemsSorted = repository['applySort'](items, 'price', 'asc');
      expect(itemsSorted).toStrictEqual(items);
    });

    test('Should sort items', async () => {
      const items = [
        StubEntity.create({ name: 'b', price: 5 }),
        StubEntity.create({ name: 'a', price: 5 }),
        StubEntity.create({ name: 'c', price: 5 }),
      ];
      let itemsSorted = repository['applySort'](items, 'name', 'asc');
      expect(itemsSorted).toStrictEqual([items[1], items[0], items[2]]);
      itemsSorted = repository['applySort'](items, 'name', 'desc');
      expect(itemsSorted).toStrictEqual([items[2], items[0], items[1]]);
    });
  });

  describe('applyPaginate method', () => {
    test('Should paginate items', async () => {
      const items = [
        StubEntity.create({ name: 'a', price: 5 }),
        StubEntity.create({ name: 'b', price: 5 }),
        StubEntity.create({ name: 'c', price: 5 }),
        StubEntity.create({ name: 'd', price: 5 }),
        StubEntity.create({ name: 'e', price: 5 }),
      ];

      let itemsPaginated = repository['applyPaginate'](items, 1, 2);
      expect(itemsPaginated).toStrictEqual([items[0], items[1]]);
      itemsPaginated = repository['applyPaginate'](items, 2, 2);
      expect(itemsPaginated).toStrictEqual([items[2], items[3]]);
      itemsPaginated = repository['applyPaginate'](items, 3, 2);
      expect(itemsPaginated).toStrictEqual([items[4]]);
      itemsPaginated = repository['applyPaginate'](items, 4, 2);
      expect(itemsPaginated).toStrictEqual([]);
    });
  });

  describe('search method', () => {
    test('Should apply only paginate when other params are null', async () => {
      const entity = StubEntity.create({ name: 'a', price: 5 });
      repository.items = Array(16).fill(entity);
      const result = await repository.search(new SearchParams());
      expect(result).toStrictEqual(
        new SearchResult({
          items: Array(15).fill(entity),
          total: 16,
          currentPage: 1,
          perPage: 15,
        }),
      );
    });

    test('Should apply paginate and filter', async () => {
      const items = [
        StubEntity.create({ name: 'test', price: 5 }),
        StubEntity.create({ name: 'a', price: 5 }),
        StubEntity.create({ name: 'TEST', price: 5 }),
        StubEntity.create({ name: 'TeSt', price: 5 }),
      ];
      repository.items = items;

      let result = await repository.search(
        new SearchParams({ page: 1, perPage: 2, filter: 'TEST' }),
      );
      expect(result).toStrictEqual(
        new SearchResult({
          items: [items[0], items[2]],
          total: 3,
          currentPage: 1,
          perPage: 2,
        }),
      );

      result = await repository.search(
        new SearchParams({ page: 2, perPage: 2, filter: 'TEST' }),
      );
      expect(result).toStrictEqual(
        new SearchResult({
          items: [items[3]],
          total: 3,
          currentPage: 2,
          perPage: 2,
        }),
      );
    });

    describe('Should apply paginate and sort', () => {
      const items = [
        StubEntity.create({ name: 'b', price: 5 }),
        StubEntity.create({ name: 'a', price: 5 }),
        StubEntity.create({ name: 'd', price: 5 }),
        StubEntity.create({ name: 'e', price: 5 }),
        StubEntity.create({ name: 'c', price: 5 }),
      ];
      const arrange = [
        {
          search_params: new SearchParams({
            page: 1,
            perPage: 2,
            sort: 'name',
          }),
          search_result: new SearchResult({
            items: [items[1], items[0]],
            total: 5,
            currentPage: 1,
            perPage: 2,
          }),
        },
        {
          search_params: new SearchParams({
            page: 2,
            perPage: 2,
            sort: 'name',
          }),
          search_result: new SearchResult({
            items: [items[4], items[2]],
            total: 5,
            currentPage: 2,
            perPage: 2,
          }),
        },
        {
          search_params: new SearchParams({
            page: 1,
            perPage: 2,
            sort: 'name',
            sortDir: 'desc',
          }),
          search_result: new SearchResult({
            items: [items[3], items[2]],
            total: 5,
            currentPage: 1,
            perPage: 2,
          }),
        },
        {
          search_params: new SearchParams({
            page: 2,
            perPage: 2,
            sort: 'name',
            sortDir: 'desc',
          }),
          search_result: new SearchResult({
            items: [items[4], items[0]],
            total: 5,
            currentPage: 2,
            perPage: 2,
          }),
        },
      ];

      beforeEach(() => {
        repository.items = items;
      });

      test.each(arrange)(
        'when value is %j',
        async ({ search_params, search_result }) => {
          const result = await repository.search(search_params);
          expect(result).toStrictEqual(search_result);
        },
      );
    });

    test('Should search using filter, sort and paginate', async () => {
      const items = [
        StubEntity.create({ name: 'test', price: 5 }),
        StubEntity.create({ name: 'a', price: 5 }),
        StubEntity.create({ name: 'TEST', price: 5 }),
        StubEntity.create({ name: 'e', price: 5 }),
        StubEntity.create({ name: 'TeSt', price: 5 }),
      ];
      repository.items = items;
      const arrange = [
        {
          params: new SearchParams({
            page: 1,
            perPage: 2,
            sort: 'name',
            filter: 'TEST',
          }),
          result: new SearchResult({
            items: [items[2], items[4]],
            total: 3,
            currentPage: 1,
            perPage: 2,
          }),
        },
        {
          params: new SearchParams({
            page: 2,
            perPage: 2,
            sort: 'name',
            filter: 'TEST',
          }),
          result: new SearchResult({
            items: [items[0]],
            total: 3,
            currentPage: 2,
            perPage: 2,
          }),
        },
      ];
      for (const i of arrange) {
        const result = await repository.search(i.params);
        expect(result).toStrictEqual(i.result);
      }
    });
  });
});
