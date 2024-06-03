import { Entity } from '@core/shared/domain/entity/entity';
import { IRepository } from '@core/shared/domain/repository/repository.interface';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { InvalidArgumentError } from '@core/shared/domain/errors/invalid-argument.error';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';

export abstract class InMemoryRepository<
  E extends Entity,
  EntityId extends Uuid,
> implements IRepository<E, EntityId>
{
  items: E[] = [];

  async bulkInsert(entities: E[]): Promise<void> {
    this.items.push(...entities);
  }

  async delete(entityId: EntityId): Promise<void> {
    const indexFound = this.items.findIndex((item) =>
      item.entityId.equals(entityId),
    );
    if (indexFound === -1) {
      throw new NotFoundError(entityId.value, this.getEntity());
    }
    this.items.splice(indexFound, 1);
  }

  async existsById(
    ids: EntityId[],
  ): Promise<{ exists: EntityId[]; notExists: EntityId[] }> {
    if (!ids.length) {
      throw new InvalidArgumentError(
        'ids must be an array with at least one element',
      );
    }
    if (this.items.length === 0) {
      return {
        exists: [],
        notExists: ids,
      };
    }
    const existsId = new Set<EntityId>();
    const notExistsId = new Set<EntityId>();
    ids.forEach((id) => {
      const item = this.items.find((entity) => entity.entityId.equals(id));
      item ? existsId.add(id) : notExistsId.add(id);
    });
    return {
      exists: Array.from(existsId.values()),
      notExists: Array.from(notExistsId.values()),
    };
  }

  async findAll(): Promise<any[]> {
    return this.items;
  }

  async findById(entity_id: EntityId): Promise<E | null> {
    const item = this.items.find((item) => item.entityId.equals(entity_id));
    return typeof item === 'undefined' ? null : item;
  }

  async findByIds(ids: EntityId[]): Promise<E[]> {
    return this.items.filter((entity) => {
      return ids.some((id) => entity.entityId.equals(id));
    });
  }

  abstract getEntity(): new (...args: any[]) => E;

  async insert(entity: E): Promise<void> {
    this.items.push(entity);
  }

  async update(entity: E): Promise<void> {
    const indexFound = this.items.findIndex((item) => {
      return item.entityId.equals(entity.entityId);
    });
    if (indexFound === -1) {
      throw new NotFoundError(entity.entityId, this.getEntity());
    }
    this.items[indexFound] = entity;
  }
}
