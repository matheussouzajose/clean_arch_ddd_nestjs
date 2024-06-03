import { FieldsErrors } from '@core/shared/domain/validators/validator-fields-interface';

export abstract class BaseValidationError extends Error {
  protected constructor(
    public error: FieldsErrors[],
    message = 'Validation Error',
  ) {
    super(message);
  }

  count() {
    return Object.keys(this.error).length;
  }
}

export class ValidationError extends Error {}

export class EntityValidationError extends BaseValidationError {
  constructor(public error: FieldsErrors[]) {
    super(error, 'Entity Validation Error');
    this.name = 'EntityValidationError';
  }
}

export class SearchValidationError extends BaseValidationError {
  constructor(error: FieldsErrors[]) {
    super(error, 'Search Validation Error');
    this.name = 'SearchValidationError';
  }
}

export class LoadEntityError extends BaseValidationError {
  constructor(public error: FieldsErrors[]) {
    super(error, 'LoadEntityError');
    this.name = 'LoadEntityError';
  }
}
