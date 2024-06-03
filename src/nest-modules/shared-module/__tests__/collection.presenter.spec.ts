import { instanceToPlain } from 'class-transformer';
import { CollectionPresenter } from '../collection.presenter';
import { PaginationPresenter } from '../pagination.presenter';

class StubCollectionPresenter extends CollectionPresenter {
  data = [1, 2, 3];
}

describe('CollectionPresenter Unit Tests', () => {
  describe('constructor', () => {
    test('should set values', () => {
      const presenter = new StubCollectionPresenter({
        currentPage: 1,
        perPage: 2,
        lastPage: 3,
        total: 4,
      });

      expect(presenter['paginationPresenter']).toBeInstanceOf(
        PaginationPresenter,
      );
      expect(presenter['paginationPresenter'].currentPage).toBe(1);
      expect(presenter['paginationPresenter'].perPage).toBe(2);
      expect(presenter['paginationPresenter'].lastPage).toBe(3);
      expect(presenter['paginationPresenter'].total).toBe(4);
      expect(presenter.meta).toEqual(presenter['paginationPresenter']);
    });
  });

  test('should presenter data', () => {
    let presenter = new StubCollectionPresenter({
      currentPage: 1,
      perPage: 2,
      lastPage: 3,
      total: 4,
    });

    expect(instanceToPlain(presenter)).toStrictEqual({
      data: [1, 2, 3],
      meta: {
        currentPage: 1,
        perPage: 2,
        lastPage: 3,
        total: 4,
      },
    });

    presenter = new StubCollectionPresenter({
      currentPage: '1' as any,
      perPage: '2' as any,
      lastPage: '3' as any,
      total: '4' as any,
    });

    expect(instanceToPlain(presenter)).toStrictEqual({
      data: [1, 2, 3],
      meta: {
        currentPage: 1,
        perPage: 2,
        lastPage: 3,
        total: 4,
      },
    });
  });
});
