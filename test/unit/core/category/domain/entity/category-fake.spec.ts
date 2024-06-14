import { Chance } from 'chance';
import { CategoryFakeBuilder } from '@core/category/domain/entity/category-fake.builder';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';

describe('CategoryFakerBuilder Unit Tests', () => {
  describe('category_id prop', () => {
    const faker = CategoryFakeBuilder.aCategory();

    test('should throw error when any with methods has called', () => {
      expect(() => faker.category_id).toThrowError(
        new Error(
          "Property category_id not have a factory, use 'with' methods",
        ),
      );
    });

    test('should be undefined', () => {
      expect(faker['_category_id']).toBeUndefined();
    });

    test('withCategoryId', () => {
      const category_id = new Uuid();
      const $this = faker.withCategoryId(category_id);
      expect($this).toBeInstanceOf(CategoryFakeBuilder);
      expect(faker['_category_id']).toBe(category_id);
      faker.withCategoryId(() => category_id);
      //@ts-expect-error _category_id is a callable
      expect(faker['_category_id']()).toBe(category_id);
      expect(faker.category_id).toBe(category_id);
    });

    // TODO - melhorar este nome
    test('should pass index to category_id factory', () => {
      let mockFactory = jest.fn(() => new Uuid());
      faker.withCategoryId(mockFactory);
      faker.build();
      expect(mockFactory).toHaveBeenCalledTimes(1);
      const categoryId = new Uuid();
      mockFactory = jest.fn(() => categoryId);
      const fakerMany = CategoryFakeBuilder.theCategories(2);
      fakerMany.withCategoryId(mockFactory);
      fakerMany.build();
      expect(mockFactory).toHaveBeenCalledTimes(2);
      expect(fakerMany.build()[0].entityId).toEqual(categoryId);
      expect(fakerMany.build()[1].entityId).toEqual(categoryId);
    });
  });

  describe('name prop', () => {
    const faker = CategoryFakeBuilder.aCategory();
    test('should be a function', () => {
      expect(typeof faker['_name']).toBe('function');
    });

    test('should call the word method', () => {
      const chance = Chance();
      const spyWordMethod = jest.spyOn(chance, 'word');
      faker['chance'] = chance;
      faker.build();
      expect(spyWordMethod).toHaveBeenCalled();
    });

    test('withName', () => {
      const $this = faker.withName('test name');
      expect($this).toBeInstanceOf(CategoryFakeBuilder);
      expect(faker['_name']).toBe('test name');
      faker.withName(() => 'test name');
      //@ts-expect-error name is callable
      expect(faker['_name']()).toBe('test name');
      expect(faker.name).toBe('test name');
    });

    test('should pass index to name factory', () => {
      faker.withName((index) => `test name ${index}`);
      const category = faker.build();
      expect(category.getName()).toBe(`test name 0`);
      const fakerMany = CategoryFakeBuilder.theCategories(2);
      fakerMany.withName((index) => `test name ${index}`);
      const categories = fakerMany.build();
      expect(categories[0].getName()).toBe(`test name 0`);
      expect(categories[1].getName()).toBe(`test name 1`);
    });

    test('invalid too long case', () => {
      const $this = faker.withInvalidNameTooLong();
      expect($this).toBeInstanceOf(CategoryFakeBuilder);
      expect(faker['_name'].length).toBe(256);
      const tooLong = 'a'.repeat(256);
      faker.withInvalidNameTooLong(tooLong);
      expect(faker['_name'].length).toBe(256);
      expect(faker['_name']).toBe(tooLong);
    });
  });

  describe('description prop', () => {
    const faker = CategoryFakeBuilder.aCategory();
    test('should be a function', () => {
      expect(typeof faker['_description']).toBe('function');
    });

    test('should call the paragraph method', () => {
      const chance = Chance();
      const spyParagraphMethod = jest.spyOn(chance, 'paragraph');
      faker['chance'] = chance;
      faker.build();
      expect(spyParagraphMethod).toHaveBeenCalled();
    });

    test('withDescription', () => {
      const $this = faker.withDescription('test description');
      expect($this).toBeInstanceOf(CategoryFakeBuilder);
      expect(faker['_description']).toBe('test description');
      faker.withDescription(() => 'test description');
      //@ts-expect-error description is callable
      expect(faker['_description']()).toBe('test description');
      expect(faker.description).toBe('test description');
    });

    test('should pass index to description factory', () => {
      faker.withDescription((index) => `test description ${index}`);
      const category = faker.build();
      expect(category.getDescription()).toBe(`test description 0`);
      const fakerMany = CategoryFakeBuilder.theCategories(2);
      fakerMany.withDescription((index) => `test description ${index}`);
      const categories = fakerMany.build();
      expect(categories[0].getDescription()).toBe(`test description 0`);
      expect(categories[1].getDescription()).toBe(`test description 1`);
    });
  });

  describe('is_active prop', () => {
    const faker = CategoryFakeBuilder.aCategory();
    test('should be a function', () => {
      expect(typeof faker['_is_active']).toBe('function');
    });

    test('activate', () => {
      const $this = faker.activate();
      expect($this).toBeInstanceOf(CategoryFakeBuilder);
      expect(faker['_is_active']).toBe(true);
      expect(faker.is_active).toBe(true);
    });

    test('deactivate', () => {
      const $this = faker.deactivate();
      expect($this).toBeInstanceOf(CategoryFakeBuilder);
      expect(faker['_is_active']).toBe(false);
      expect(faker.is_active).toBe(false);
    });
  });

  describe('created_at prop', () => {
    const faker = CategoryFakeBuilder.aCategory();

    test('should throw error when any with methods has called', () => {
      const fakerCategory = CategoryFakeBuilder.aCategory();
      expect(() => fakerCategory.created_at).toThrowError(
        new Error("Property created_at not have a factory, use 'with' methods"),
      );
    });

    test('should be undefined', () => {
      expect(faker['_created_at']).toBeUndefined();
    });

    test('withCreatedAt', () => {
      const date = new Date();
      const $this = faker.withCreatedAt(date);
      expect($this).toBeInstanceOf(CategoryFakeBuilder);
      expect(faker['_created_at']).toBe(date);
      faker.withCreatedAt(() => date);
      //@ts-expect-error _created_at is a callable
      expect(faker['_created_at']()).toBe(date);
      expect(faker.created_at).toBe(date);
    });

    test('should pass index to created_at factory', () => {
      const date = new Date();
      faker.withCreatedAt(date);
      const category = faker.build();
      expect(category.getCreatedAt()).toBe(date.toISOString());
      const fakerMany = CategoryFakeBuilder.theCategories(2);
      fakerMany.withCreatedAt(date);
      const categories = fakerMany.build();
      expect(categories[0].getCreatedAt()).toBe(date.toISOString());
      expect(categories[1].getCreatedAt()).toBe(date.toISOString());
    });
  });

  test('should create a category', () => {
    const faker = CategoryFakeBuilder.aCategory();
    let category = faker.build();
    expect(category.entityId).toBeInstanceOf(Uuid);
    expect(typeof category.getName() === 'string').toBeTruthy();
    expect(typeof category.getDescription() === 'string').toBeTruthy();
    expect(category.getIsActive()).toBe(true);
    expect(category.getCreatedAt()).toBeDefined();
    const created_at = new Date();
    const category_id = new Uuid();
    category = faker
      .withCategoryId(category_id)
      .withName('name test')
      .withDescription('description test')
      .deactivate()
      .withCreatedAt(created_at)
      .build();
    expect(category.entityId.value).toBe(category_id.value);
    expect(category.getName()).toBe('name test');
    expect(category.getDescription()).toBe('description test');
    expect(category.getIsActive()).toBe(false);
    // expect(category.getCreatedAt()).toEqual(created_at.toISOString());
  });

  test('should create many categories-module', () => {
    const faker = CategoryFakeBuilder.theCategories(2);
    let categories = faker.build();
    categories.forEach((category) => {
      expect(category.entityId).toBeInstanceOf(Uuid);
      expect(typeof category.getName() === 'string').toBeTruthy();
      expect(typeof category.getDescription() === 'string').toBeTruthy();
      expect(category.getIsActive()).toBe(true);
      expect(category.getCreatedAt()).toBeDefined();
    });
    const created_at = new Date();
    const category_id = new Uuid();
    categories = faker
      .withCategoryId(category_id)
      .withName('name test')
      .withDescription('description test')
      .deactivate()
      .withCreatedAt(created_at)
      .build();
    categories.forEach((category) => {
      expect(category.entityId.value).toBe(category_id.value);
      expect(category.getName()).toBe('name test');
      expect(category.getDescription()).toBe('description test');
      expect(category.getIsActive()).toBe(false);
      expect(category.getCreatedAt()).toEqual(created_at.toISOString());
    });
  });
});
