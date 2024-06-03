import { Entity } from '@core/shared/domain/entity/entity';
import { ValueObject } from '@core/shared/domain/value-objects/value-object';
import { IRepository } from '@core/shared/domain/repository/repository.interface';
import { SearchParams } from '@core/shared/domain/repository/search-params';
import { SearchResult } from '@core/shared/domain/repository/search-result';

export interface ISearchableRepository<
  E extends Entity,
  EntityId extends ValueObject,
  Filter = string,
  SearchInput = SearchParams<Filter>,
  SearchOutput = SearchResult,
> extends IRepository<E, EntityId> {
  sortableFields: string[];
  search(props: SearchInput): Promise<SearchOutput>;
}
