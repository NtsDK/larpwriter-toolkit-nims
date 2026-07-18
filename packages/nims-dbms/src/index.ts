export { DatabaseEngine } from './engine/DatabaseEngine';
export * from './domain/types';
export { NimsError, ValidationError, EntityExistsError, EntityNotExistsError, InternalError } from './utils/errors';

import { DatabaseEngine } from './engine/DatabaseEngine';
import type { Database } from './domain/types';

export interface ServerDbmsOptions {
  adminLogin?: string;
  adminPass?: string;
}

/**
 * Creates a DatabaseEngine instance compatible with nims-server.
 * The returned object has the same method interface as the legacy LocalDBMS.
 */
export function createServerDbms(database: Database, opts?: ServerDbmsOptions): DatabaseEngine {
  const engine = new DatabaseEngine(database);
  if (opts?.adminLogin && opts?.adminPass) {
    engine.ensureAdminExists(opts.adminLogin, opts.adminPass);
  }
  return engine;
}
