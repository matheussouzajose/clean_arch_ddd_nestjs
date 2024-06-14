import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { CategoryValidatorFactory } from '@core/category/domain/validator/category.validator';
import { CategoryFakeBuilder } from '@core/category/domain/entity/category-fake.builder';
import { AggregateRoot } from '@core/shared/domain/entity/aggregate-root';

export type CategoryConstructorProps = {
  categoryId: CategoryId;
  name: string;
  description?: string;
  isActive?: boolean;
  createdAt: Date;
};

export type CategoryCreateCommand = Omit<
  CategoryConstructorProps,
  'categoryId' | 'createdAt'
>;

export type CategoryRestoreCommand = {
  categoryId: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
};

export class CategoryId extends Uuid {}

export class Category extends AggregateRoot {
  private readonly categoryId: CategoryId;
  private name: string;
  private description: string;
  private isActive: boolean;
  private readonly createdAt: Date;

  private constructor(props: CategoryConstructorProps) {
    super();
    this.categoryId = props.categoryId;
    this.name = props.name;
    this.description = props.description ?? null;
    this.isActive = props.isActive ?? true;
    this.createdAt = new Date(props.createdAt);
    this.validate(['name', 'description', 'isActive']);
  }

  static create(props: CategoryCreateCommand): Category {
    const categoryId = new Uuid();
    const createdAt = new Date();
    const category = new Category({
      categoryId,
      createdAt,
      ...props,
    });
    category.validate(['name']);
    return category;
  }

  static restore(props: CategoryRestoreCommand): Category {
    const categoryId = new Uuid(props.categoryId);
    const createdAt = new Date(props.createdAt);
    const category = new Category({
      categoryId,
      createdAt,
      name: props.name,
      description: props.description,
      isActive: props.isActive,
    });
    category.validate(['name', 'description', 'isActive']);
    return category;
  }

  validate(fields?: string[]) {
    const validator = CategoryValidatorFactory.create();
    return validator.validate(this.notification, this, fields);
  }

  get entityId(): CategoryId {
    return this.categoryId;
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string | null {
    return this.description;
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  getCreatedAt(): string {
    return this.createdAt.toISOString();
  }

  changeName(name: string): void {
    this.name = name;
    this.validate(['name']);
  }

  changeDescription(description: string): void {
    this.description = description;
  }

  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    this.isActive = false;
  }

  static fake() {
    return CategoryFakeBuilder;
  }

  toJSON() {
    return {
      categoryId: this.categoryId.value,
      name: this.name,
      description: this.description,
      isActive: this.isActive,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
