import { ListCategoriesInput } from '@core/category/application/use-cases/list-categories/dto/list-categories-input.dto';
import { SortDirection } from '@core/shared/domain/repository/search-params';

export class SearchCategoriesDto implements ListCategoriesInput {
  page?: number;
  perPage?: number;
  sort?: string;
  sortDir?: SortDirection;
  filter?: string;
}
