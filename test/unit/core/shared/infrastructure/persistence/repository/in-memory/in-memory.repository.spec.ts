import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { Entity } from '@core/shared/domain/entity/entity';
import { InMemoryRepository } from '@core/shared/infrastructure/persistence/repository/in-memory/in-memory.repository';
import { ValueObject } from '@core/shared/domain/value-objects/value-object';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';

type StubEntityConstructor = {
  entity_id?: Uuid;
  name: string;
  price: number;
};

class StubEntity extends Entity {
  entity_id: Uuid;
  name: string;
  price: number;

  constructor(props: StubEntityConstructor) {
    super();
    this.entity_id = props.entity_id || new Uuid();
    this.name = props.name;
    this.price = props.price;
  }

  get entityId(): ValueObject {
    return this.entity_id;
  }

  toJSON() {
    return {
      entity_id: this.entity_id.value,
      name: this.name,
      price: this.price,
    };
  }
}

class StubInMemoryRepository extends InMemoryRepository<StubEntity, Uuid> {
  getEntity(): new (...args: any[]) => StubEntity {
    return StubEntity;
  }
}

describe('In Memory Repository Unit Test', () => {
  let repository: StubInMemoryRepository;

  beforeEach(() => {
    repository = new StubInMemoryRepository();
  });

  test('Should insert a new entity', async () => {
    const entity = new StubEntity({
      entity_id: new Uuid(),
      name: 'test',
      price: 5,
    });
    await repository.insert(entity);
    expect(repository.items.length).toBe(1);
    expect(repository.items[0]).toBe(entity);
  });

  test('Should  bulk insert entities', async () => {
    const entities = [
      new StubEntity({
        entity_id: new Uuid(),
        name: 'Test',
        price: 100,
      }),
      new StubEntity({
        entity_id: new Uuid(),
        name: 'Test',
        price: 100,
      }),
    ];
    await repository.bulkInsert(entities);
    expect(repository.items.length).toBe(2);
    expect(repository.items[0]).toBe(entities[0]);
    expect(repository.items[1]).toBe(entities[1]);
  });

  test('Should returns all entities', async () => {
    const entity = new StubEntity({ name: 'name value', price: 5 });
    await repository.insert(entity);
    const entities = await repository.findAll();
    expect(entities).toStrictEqual([entity]);
  });

  test('Should throws error on update when entity not found', async () => {
    const entity = new StubEntity({ name: 'name value', price: 5 });
    await expect(repository.update(entity)).rejects.toThrow(
      new NotFoundError(entity.entityId, StubEntity),
    );
  });

  test('Should updates an entity', async () => {
    const entity = new StubEntity({ name: 'name value', price: 5 });
    await repository.insert(entity);
    const entityUpdated = new StubEntity({
      entity_id: entity.entity_id,
      name: 'updated',
      price: 1,
    });
    await repository.update(entityUpdated);
    expect(entityUpdated.toJSON()).toStrictEqual(repository.items[0].toJSON());
  });

  test('Should throws error on delete when entity not found', async () => {
    const uuid = new Uuid();
    await expect(repository.delete(uuid)).rejects.toThrow(
      new NotFoundError(uuid.value, StubEntity),
    );
    await expect(
      repository.delete(new Uuid('9366b7dc-2d71-4799-b91c-c64adb205104')),
    ).rejects.toThrow(
      new NotFoundError(
        new Uuid('9366b7dc-2d71-4799-b91c-c64adb205104').value,
        StubEntity,
      ),
    );
  });

  test('Should deletes an entity', async () => {
    const entity = new StubEntity({ name: 'name value', price: 5 });
    await repository.insert(entity);
    await repository.delete(entity.entity_id);
    expect(repository.items).toHaveLength(0);
  });

  test('Should return by ids', async () => {
    const firstEntityId = new Uuid();
    const secondEntityId = new Uuid();
    await repository.bulkInsert([
      new StubEntity({
        entity_id: firstEntityId,
        name: 'Test',
        price: 100,
      }),
      new StubEntity({
        entity_id: secondEntityId,
        name: 'Test',
        price: 100,
      }),
    ]);
    const entities = await repository.findByIds([
      firstEntityId,
      secondEntityId,
    ]);
    expect(entities.length).toBe(2);
  });

  test('Should return null when entity not found', async () => {
    const entity = await repository.findById(new Uuid());
    expect(entity).toBeNull();
  });

  test('Should return entity by id', async () => {
    const entityId = new Uuid();
    const entity = new StubEntity({
      entity_id: entityId,
      name: 'test',
      price: 5,
    });
    await repository.insert(entity);
    const result = await repository.findById(entityId);
    expect(entity.toJSON()).toStrictEqual(result.toJSON());
  });

  test('Should check exists ids', async () => {
    const firstEntityId = new Uuid();
    const secondEntityId = new Uuid();
    await repository.bulkInsert([
      new StubEntity({
        entity_id: firstEntityId,
        name: 'Test',
        price: 100,
      }),
      new StubEntity({
        entity_id: secondEntityId,
        name: 'Test',
        price: 100,
      }),
    ]);
    const entities = await repository.existsById([
      firstEntityId,
      secondEntityId,
      new Uuid(),
    ]);
    expect(entities.exists.length).toBe(2);
    expect(entities.notExists.length).toBe(1);
  });
});
