import { Notification } from '@core/shared/domain/validators/notification';
import { ValueObject } from '@core/shared/domain/value-objects/value-object';

export abstract class Entity {
  notification: Notification = new Notification();

  abstract get entityId(): ValueObject;
  abstract toJSON(): any;
}
