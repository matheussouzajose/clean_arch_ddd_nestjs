import {
  InvalidUuidError,
  Uuid,
} from '@core/shared/domain/value-objects/uuid.vo';

describe('Uuid Value Object Unit Test', () => {
  const validateSpy = jest.spyOn(Uuid.prototype as any, 'validate');

  test('Should throw error when uuid is invalid', () => {
    expect(() => {
      new Uuid('invalid');
    }).toThrow(new InvalidUuidError());
    expect(validateSpy).toHaveBeenCalled();
  });

  test('Should create a valid uuid', () => {
    const uuid = new Uuid();
    expect(uuid).toBeDefined();
    expect(validateSpy).toHaveBeenCalled();
  });

  test('Should accept a valid uuid', () => {
    const uuid = new Uuid('467494a8-8421-4d79-b8b1-511e52808fdc');
    expect(uuid.value).toBe('467494a8-8421-4d79-b8b1-511e52808fdc');
    expect(validateSpy).toHaveBeenCalled();
  });
});
