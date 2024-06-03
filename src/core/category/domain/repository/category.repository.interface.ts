import { Category } from '@core/category/domain/entity/category.entity';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { SearchParams } from '@core/shared/domain/repository/search-params';
import { ISearchableRepository } from '@core/shared/domain/repository/searchable.repository.interface';
import { SearchResult } from '@core/shared/domain/repository/search-result';

export type CategoryFilter = string;

export class CategorySearchParams extends SearchParams<CategoryFilter> {}

export class CategorySearchResult extends SearchResult<Category> {}

export interface ICategoryRepository
  extends ISearchableRepository<
    Category,
    Uuid,
    CategoryFilter,
    CategorySearchParams,
    CategorySearchResult
  > {}
