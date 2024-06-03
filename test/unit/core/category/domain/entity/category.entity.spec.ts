import { Category } from '@core/category/domain/entity/category.entity';
import { ValueObject } from '@core/shared/domain/value-objects/value-object';

describe('Category Unit Test', () => {
  beforeEach(() => {
    Category.prototype.validate = jest
      .fn()
      .mockImplementation(Category.prototype.validate);
  });

  describe('Create Category', () => {
    test('Should create an category', () => {
      const category = Category.create({
        name: 'Movie',
      });
      expect(category.getCategoryId()).toBeDefined();
      expect(category.getName()).toBe('Movie');
      expect(category.getDescription()).toBeNull();
      expect(category.getIsActive()).toBeTruthy();
      expect(category.getCreatedAt()).toBeInstanceOf(Date);
      expect(category.notification.hasErrors()).toBeFalsy();
      expect(category.entityId).toBeInstanceOf(ValueObject);
    });

    test('Should create an category with description', () => {
      const category = Category.create({
        name: 'Movie',
        description: 'Movie description',
      });
      expect(category.getDescription()).toBe('Movie description');
    });

    test('Should create an category deactivated', () => {
      const category = Category.create({
        name: 'Movie',
        description: 'Movie description',
        isActive: false,
      });
      expect(category.getIsActive()).toBeFalsy();
    });
  });

  test('Should restore an category', () => {
    const category = Category.restore({
      categoryId: 'b97b72b2-a6b9-4caf-b970-24af7aa70fe8',
      name: 'Movie',
      description: 'Movie description',
      isActive: true,
      createdAt: '2024-05-27T02:10:56.141Z',
    });
    expect(category.getCategoryId()).toBe(
      'b97b72b2-a6b9-4caf-b970-24af7aa70fe8',
    );
    expect(category.getName()).toBe('Movie');
    expect(category.getDescription()).toBe('Movie description');
    expect(category.getIsActive()).toBeTruthy();
    expect(category.getCreatedAt()).toEqual(
      new Date('2024-05-27T02:10:56.141Z'),
    );
  });

  test('Should change name', () => {
    const category = Category.create({
      name: 'Movie',
    });
    category.changeName('Movie 2');
    expect(category.getName()).toBe('Movie 2');
    expect(category.notification.hasErrors()).toBeFalsy();
  });

  test('Should change description', () => {
    const category = Category.create({
      name: 'Movie',
    });
    category.changeDescription('Description Movie');
    expect(category.getDescription()).toBe('Description Movie');
    expect(category.notification.hasErrors()).toBeFalsy();
  });

  test('Should activate category', () => {
    const category = Category.create({
      name: 'Movie',
      isActive: false,
    });
    category.activate();
    expect(category.getIsActive()).toBeTruthy();
  });

  test('Should deactivate category', () => {
    const category = Category.create({
      name: 'Movie',
    });
    category.deactivate();
    expect(category.getIsActive()).toBeFalsy();
  });

  test('Should an invalid category with name property', () => {
    const category = Category.create({ name: 't'.repeat(256) });
    expect(category.notification.hasErrors()).toBeTruthy();
    expect(category.notification).notificationContainsErrorMessages([
      {
        name: ['name must be shorter than or equal to 255 characters'],
      },
    ]);
  });

  test('Should an invalid category when change name', () => {
    const category = Category.create({ name: 'Movie' });
    category.changeName('t'.repeat(256));
    expect(category.notification.hasErrors()).toBeTruthy();
    expect(category.notification).notificationContainsErrorMessages([
      {
        name: ['name must be shorter than or equal to 255 characters'],
      },
    ]);
  });
});
