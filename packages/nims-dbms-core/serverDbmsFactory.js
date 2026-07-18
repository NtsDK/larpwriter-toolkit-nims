'use strict';

/**
 * Compatibility shim for nims-server.
 * The old factory accepted a complex options object and built the DBMS via prototype mixins.
 * The new engine is a single TypeScript class. This shim bridges the gap.
 */
const { createServerDbms } = require('nims-dbms');

module.exports = function serverDbmsFactory(opts = {}) {
  const { serverSpecific = {} } = opts;

  const emptyBase = { Meta: { name: '', description: '', date: '', preGameDate: '', saveTime: '' }, Characters: {}, Players: {}, Stories: {}, Relations: [], Groups: {}, CharacterProfileStructure: [], PlayerProfileStructure: [], ProfileBindings: {}, ManagementInfo: { UsersInfo: {} }, Version: '0.8.0', Log: [] };

  const db = createServerDbms(emptyBase);

  // The server expects db, rawDb, preparedDb
  return {
    db,
    rawDb: db,
    preparedDb: db,
  };
};
