import { ValidationError, EntityExistsError, EntityNotExistsError } from './errors';

export function ensureString(value: unknown, label = 'value'): asserts value is string {
  if (typeof value !== 'string') {
    throw new ValidationError('errors-argument-is-not-a-string', [label, value]);
  }
}

export function ensureNumber(value: unknown, label = 'value'): asserts value is number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new ValidationError('errors-argument-is-not-a-number', [label, value]);
  }
}

export function ensureBoolean(value: unknown, label = 'value'): asserts value is boolean {
  if (typeof value !== 'boolean') {
    throw new ValidationError('errors-argument-is-not-a-boolean', [label, value]);
  }
}

export function ensureArray(value: unknown, label = 'value'): asserts value is unknown[] {
  if (!Array.isArray(value)) {
    throw new ValidationError('errors-argument-is-not-an-array', [label, value]);
  }
}

export function ensureNotEmpty(value: string, label = 'value'): void {
  if (value.trim().length === 0) {
    throw new ValidationError('errors-argument-is-not-a-not-empty-string', [label]);
  }
}

export function ensureInRange(index: number, min: number, max: number): void {
  if (index < min || index > max) {
    throw new ValidationError('errors-argument-is-not-in-range', [index, min, max]);
  }
}

export function ensureEnum<T extends string>(value: string, allowed: readonly T[], label = 'value'): asserts value is T {
  if (!allowed.includes(value as T)) {
    throw new ValidationError('errors-argument-is-not-in-enum', [label, value, allowed]);
  }
}

export function ensureEntityExists(name: string, existingNames: string[]): void {
  if (!existingNames.includes(name)) {
    throw new EntityNotExistsError(name);
  }
}

export function ensureEntityNotExists(name: string, existingNames: string[]): void {
  if (existingNames.includes(name)) {
    throw new EntityExistsError(name);
  }
}

export function ensureEntityCanBeCreated(name: string, existingNames: string[]): void {
  ensureString(name, 'entityName');
  ensureNotEmpty(name, 'entityName');
  ensureEntityNotExists(name, existingNames);
}

export function ensureEntityCanBeRenamed(fromName: string, toName: string, existingNames: string[]): void {
  ensureString(fromName, 'fromName');
  ensureString(toName, 'toName');
  ensureNotEmpty(toName, 'toName');
  ensureEntityExists(fromName, existingNames);
  if (fromName !== toName) {
    ensureEntityNotExists(toName, existingNames);
  }
}
