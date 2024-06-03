import { SortDirection } from '@core/shared/domain/repository/search-params';
import { CategoryFilter } from '@core/category/domain/repository/category.repository.interface';

export type ListCategoriesInput = {
  page?: number;
  perPage?: number;
  sort?: string | null;
  sortDir?: SortDirection | null;
  filter?: CategoryFilter | null;
};
