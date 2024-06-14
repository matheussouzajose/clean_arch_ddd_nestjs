import { Category } from '@core/category/domain/entity/category.aggregate';
import { CategoryModel } from '@core/category/infrastructure/persistence/repository/sequelize/category.model';
import { LoadEntityError } from '@core/shared/domain/errors/validation.error';

export class CategoryModelMapper {
  static toModel(entity: Category): CategoryModel {
    return CategoryModel.build({
      category_id: entity.entityId.value,
      name: entity.getName(),
      description: entity.getDescription(),
      is_active: entity.getIsActive(),
      created_at: new Date(entity.getCreatedAt()),
    });
  }

  static toEntity(model: CategoryModel): Category {
    const category = Category.restore({
      categoryId: model.category_id,
      name: model.name,
      description: model.description,
      isActive: model.is_active,
      createdAt: model.created_at.toISOString(),
    });
    category.validate();
    if (category.notification.hasErrors()) {
      throw new LoadEntityError(category.notification.toJSON());
    }
    return category;
  }
}
