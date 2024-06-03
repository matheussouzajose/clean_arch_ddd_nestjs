import {
  CategorySearchParams,
  CategorySearchResult,
  ICategoryRepository,
} from '@core/category/domain/repository/category.repository.interface';
import { Category } from '@core/category/domain/entity/category.entity';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { CategoryModel } from '@core/category/infrastructure/persistence/repository/sequelize/category.model';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { literal, Op } from 'sequelize';
import { SortDirection } from '@core/shared/domain/repository/search-params';
import { CategoryModelMapper } from '@core/category/infrastructure/persistence/repository/sequelize/category-model-mapper';
import { InvalidArgumentError } from '@core/shared/domain/errors/invalid-argument.error';

export class CategorySequelizeRepository implements ICategoryRepository {
  constructor(private readonly categoryModel: typeof CategoryModel) {}

  sortableFields: string[] = ['name', 'createdAt'];
  orderBy = {
    mysql: {
      name: (sort_dir: SortDirection) => literal(`binary name ${sort_dir}`), //ascii
    },
  };

  async bulkInsert(entities: Category[]): Promise<void> {
    const modelsProps = entities.map((entity) =>
      CategoryModelMapper.toModel(entity).toJSON(),
    );
    await this.categoryModel.bulkCreate(modelsProps);
  }

  async delete(entityId: Uuid): Promise<void> {
    const id = entityId.value;
    const affectedRows = await this.categoryModel.destroy({
      where: { category_id: id },
    });
    if (affectedRows !== 1) {
      throw new NotFoundError(id, this.getEntity());
    }
  }

  async existsById(
    ids: Uuid[],
  ): Promise<{ exists: Uuid[]; notExists: Uuid[] }> {
    if (!ids.length) {
      throw new InvalidArgumentError(
        'ids must be an array with at least one element',
      );
    }
    const existsCategoryModels = await this.categoryModel.findAll({
      attributes: ['category_id'],
      where: {
        category_id: {
          [Op.in]: ids.map((id) => id.value),
        },
      },
    });
    const existsCategoryIds = existsCategoryModels.map(
      (m) => new Uuid(m.category_id),
    );
    const notExistsCategoryIds = ids.filter(
      (id) => !existsCategoryIds.some((e) => e.equals(id)),
    );
    return {
      exists: existsCategoryIds,
      notExists: notExistsCategoryIds,
    };
  }

  async findAll(): Promise<Category[]> {
    const models = await this.categoryModel.findAll();
    return models.map((model) => {
      return CategoryModelMapper.toEntity(model);
    });
  }

  async findById(entityId: Uuid): Promise<Category | null> {
    const model = await this.categoryModel.findByPk(entityId.value);
    return model ? CategoryModelMapper.toEntity(model) : null;
  }

  async findByIds(ids: Uuid[]): Promise<Category[]> {
    const models = await this.categoryModel.findAll({
      where: {
        category_id: {
          [Op.in]: ids.map((id) => id.value),
        },
      },
    });
    return models.map((m) => CategoryModelMapper.toEntity(m));
  }

  getEntity(): { new (...args: any[]): Category } {
    return Category;
  }

  async insert(entity: Category): Promise<void> {
    const modelProps = CategoryModelMapper.toModel(entity);
    await this.categoryModel.create(modelProps.toJSON());
  }

  async update(entity: Category): Promise<void> {
    const id = entity.getCategoryId();
    const modelProps = CategoryModelMapper.toModel(entity);
    const [affectedRows] = await this.categoryModel.update(
      modelProps.toJSON(),
      {
        where: { category_id: id },
      },
    );
    if (affectedRows !== 1) {
      throw new NotFoundError(id, this.getEntity());
    }
  }

  async search(props: CategorySearchParams): Promise<CategorySearchResult> {
    const offset = (props.page - 1) * props.perPage;
    const limit = props.perPage;
    const { rows: models, count } = await this.categoryModel.findAndCountAll({
      ...(props.filter && {
        where: {
          name: { [Op.like]: `%${props.filter}%` },
        },
      }),
      ...(props.sort && this.sortableFields.includes(props.sort)
        ? //? { order: [[props.sort, props.sort_dir]] }
          { order: this.formatSort(props.sort, props.sortDir!) }
        : { order: [['created_at', 'desc']] }),
      offset,
      limit,
    });
    return new CategorySearchResult({
      items: models.map((model) => {
        return CategoryModelMapper.toEntity(model);
      }),
      currentPage: props.page,
      perPage: props.perPage,
      total: count,
    });
  }

  private formatSort(sort: string, sort_dir: SortDirection) {
    const dialect = this.categoryModel.sequelize!.getDialect() as 'mysql';
    if (this.orderBy[dialect] && this.orderBy[dialect][sort]) {
      return this.orderBy[dialect][sort](sort_dir);
    }
    return [[sort, sort_dir]];
  }
}
