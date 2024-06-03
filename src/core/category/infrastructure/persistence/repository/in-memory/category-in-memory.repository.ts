import { InMemorySearchableRepository } from '@core/shared/infrastructure/persistence/repository/in-memory/in-memory-searchable.repository';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { Category } from '@core/category/domain/entity/category.entity';
import {
  CategoryFilter,
  ICategoryRepository,
} from '@core/category/domain/repository/category.repository.interface';
import { SortDirection } from '@core/shared/domain/repository/search-params';

export class CategoryInMemoryRepository
  extends InMemorySearchableRepository<Category, Uuid>
  implements ICategoryRepository
{
  sortableFields: string[] = ['name', 'createdAt'];

  protected async applyFilter(
    items: Category[],
    filter: CategoryFilter | null,
  ): Promise<Category[]> {
    if (!filter) {
      return items;
    }
    return items.filter((i) => {
      return i.getName().toLowerCase().includes(filter.toLowerCase());
    });
  }

  getEntity(): new (...args: any[]) => Category {
    return Category;
  }

  protected applySort(
    items: Category[],
    sort: string | null,
    sort_dir: SortDirection | null,
  ) {
    return sort
      ? super.applySort(items, sort, sort_dir)
      : super.applySort(items, 'createdAt', 'desc');
  }
}
