import { Entity } from '@core/shared/domain/entity/entity';
import { ISearchableRepository } from '@core/shared/domain/repository/searchable.repository.interface';
import {
  SearchParams,
  SortDirection,
} from '@core/shared/domain/repository/search-params';
import { SearchResult } from '@core/shared/domain/repository/search-result';
import { InMemoryRepository } from '@core/shared/infrastructure/persistence/repository/in-memory/in-memory.repository';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';

export abstract class InMemorySearchableRepository<
    E extends Entity,
    EntityId extends Uuid,
    Filter = string,
  >
  extends InMemoryRepository<E, EntityId>
  implements ISearchableRepository<E, EntityId, Filter>
{
  sortableFields: string[] = [];

  async search(props: SearchParams<Filter>): Promise<SearchResult<E>> {
    const itemsFiltered = await this.applyFilter(this.items, props.filter);
    const itemsSorted = this.applySort(
      itemsFiltered,
      props.sort,
      props.sortDir,
    );
    const itemsPaginated = this.applyPaginate(
      itemsSorted,
      props.page,
      props.perPage,
    );
    return new SearchResult({
      items: itemsPaginated,
      total: itemsFiltered.length,
      currentPage: props.page,
      perPage: props.perPage,
    });
  }

  protected abstract applyFilter(
    items: E[],
    filter: Filter | null,
  ): Promise<E[]>;

  protected applyPaginate(
    items: E[],
    page: SearchParams['page'],
    perPage: SearchParams['perPage'],
  ) {
    const start = (page - 1) * perPage; // 0 * 15 = 0
    const limit = start + perPage; // 0 + 15 = 15
    return items.slice(start, limit);
  }

  protected applySort(
    items: E[],
    sort: string | null,
    sortDir: SortDirection | null,
    custom_getter?: (sort: string, item: E) => any,
  ) {
    if (!sort || !this.sortableFields.includes(sort)) {
      return items;
    }
    return [...items].sort((a, b) => {
      const aValue = custom_getter ? custom_getter(sort, a) : a[sort];
      const bValue = custom_getter ? custom_getter(sort, b) : b[sort];
      if (aValue < bValue) {
        return sortDir === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDir === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
}
