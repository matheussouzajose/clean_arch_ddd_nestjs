import { ValueObject } from '@core/shared/domain/value-objects/value-object';
import { v4 as uuidV4, validate as uuidValidate } from 'uuid';

export class Uuid extends ValueObject {
  readonly value: string;

  constructor(id?: string) {
    super();
    this.value = id || uuidV4();
    this.validate();
  }

  private validate() {
    const isValid = uuidValidate(this.value);
    if (!isValid) {
      throw new InvalidUuidError();
    }
  }
}

export class InvalidUuidError extends Error {
  constructor(message?: string) {
    super(message || 'ID must be valid uuid');
    this.name = 'InvalidUuidError';
  }
}
