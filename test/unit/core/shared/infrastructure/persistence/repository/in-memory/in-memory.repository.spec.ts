import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { Entity } from '@core/shared/domain/entity/entity';
import { InMemoryRepository } from '@core/shared/infrastructure/persistence/repository/in-memory/in-memory.repository';
import { ValueObject } from '@core/shared/domain/value-objects/value-object';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';

type StubEntityConstructor = {
  stubId: StubId;
  name: string;
  price: number;
};

type StubEntityCommandCreate = Omit<StubEntityConstructor, 'stubId'>;

type StubEntityCommandRestore = {
  stubId: string;
  name: string;
  price: number;
};

class StubId extends Uuid {}

class StubEntity extends Entity {
  stubId: StubId;
  name: string;
  price: number;

  private constructor(props: StubEntityConstructor) {
    super();
    this.stubId = props.stubId || new StubId();
    this.name = props.name;
    this.price = props.price;
  }

  static create(input: StubEntityCommandCreate) {
    return new StubEntity({
      ...input,
      stubId: new StubId(),
    });
  }

  static restore(input: StubEntityCommandRestore) {
    return new StubEntity({
      ...input,
      stubId: new StubId(input.stubId),
    });
  }

  get entityId(): ValueObject {
    return this.stubId;
  }

  toJSON() {
    return {
      stubId: this.stubId.value,
      name: this.name,
      price: this.price,
    };
  }
}

class StubInMemoryRepository extends InMemoryRepository<StubEntity, StubId> {}

describe('In Memory Repository Unit Test', () => {
  let repository: StubInMemoryRepository;

  beforeEach(() => {
    repository = new StubInMemoryRepository();
  });

  test('Should insert a new entity', async () => {
    const entity = StubEntity.create({
      name: 'test',
      price: 5,
    });
    await repository.insert(entity);
    expect(repository.items.length).toBe(1);
    expect(repository.items[0]).toBe(entity);
  });

  test('Should bulk insert entities', async () => {
    const entities = [
      StubEntity.create({
        name: 'Test',
        price: 100,
      }),
      StubEntity.create({
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
    const entity = StubEntity.create({ name: 'name value', price: 5 });
    await repository.insert(entity);
    const entities = await repository.findAll();
    expect(entities).toStrictEqual([entity]);
  });

  test('Should throws error on update when entity not found', async () => {
    const entity = StubEntity.create({ name: 'name value', price: 5 });
    await expect(repository.update(entity)).rejects.toThrow(
      new NotFoundError(entity.entityId),
    );
  });

  test('Should updates an entity', async () => {
    const entity = StubEntity.create({ name: 'name value', price: 5 });
    await repository.insert(entity);
    const entityUpdated = StubEntity.restore({
      stubId: entity.stubId.value,
      name: 'updated',
      price: 1,
    });
    await repository.update(entityUpdated);
    expect(entityUpdated.toJSON()).toStrictEqual(repository.items[0].toJSON());
  });

  test('Should throws error on delete when entity not found', async () => {
    const uuid = new StubId();
    await expect(repository.delete(uuid)).rejects.toThrow(
      new NotFoundError(uuid.value),
    );
    await expect(
      repository.delete(new StubId('9366b7dc-2d71-4799-b91c-c64adb205104')),
    ).rejects.toThrow(
      new NotFoundError(
        new StubId('9366b7dc-2d71-4799-b91c-c64adb205104').value,
      ),
    );
  });

  test('Should deletes an entity', async () => {
    const entity = StubEntity.create({ name: 'name value', price: 5 });
    await repository.insert(entity);
    await repository.delete(entity.stubId);
    expect(repository.items).toHaveLength(0);
  });

  test('Should return by ids', async () => {
    const firstEntityId = new StubId();
    const secondEntityId = new StubId();
    await repository.bulkInsert([
      StubEntity.restore({
        stubId: firstEntityId.value,
        name: 'Test',
        price: 100,
      }),
      StubEntity.restore({
        stubId: secondEntityId.value,
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
    const entity = await repository.findById(new StubId());
    expect(entity).toBeNull();
  });

  test('Should return entity by id', async () => {
    const entityId = new StubId();
    const entity = StubEntity.restore({
      stubId: entityId.value,
      name: 'test',
      price: 5,
    });
    await repository.insert(entity);
    const result = await repository.findById(entityId);
    expect(entity.toJSON()).toStrictEqual(result.toJSON());
  });

  test('Should check exists ids', async () => {
    const firstEntityId = new StubId();
    const secondEntityId = new StubId();
    await repository.bulkInsert([
      StubEntity.restore({
        stubId: firstEntityId.value,
        name: 'Test',
        price: 100,
      }),
      StubEntity.restore({
        stubId: secondEntityId.value,
        name: 'Test',
        price: 100,
      }),
    ]);
    const entities = await repository.existsById([
      firstEntityId,
      secondEntityId,
      new StubId(),
    ]);
    expect(entities.exists.length).toBe(2);
    expect(entities.notExists.length).toBe(1);
  });
});
