export class NimsError extends Error {
  messageId: string;
  parameters: unknown[];

  constructor(messageId: string, parameters: unknown[] = []) {
    super(messageId);
    this.messageId = messageId;
    this.parameters = parameters;
    this.name = 'NimsError';
  }
}

export class ValidationError extends NimsError {
  constructor(messageId: string, parameters: unknown[] = []) {
    super(messageId, parameters);
    this.name = 'ValidationError';
  }
}

export class EntityExistsError extends NimsError {
  constructor(entityName: string) {
    super('errors-entity-already-exists', [entityName]);
    this.name = 'EntityExistsError';
  }
}

export class EntityNotExistsError extends NimsError {
  constructor(entityName: string) {
    super('errors-entity-is-not-exist', [entityName]);
    this.name = 'EntityNotExistsError';
  }
}

export class InternalError extends NimsError {
  constructor(messageId: string, parameters: unknown[] = []) {
    super(messageId, parameters);
    this.name = 'InternalError';
  }
}
