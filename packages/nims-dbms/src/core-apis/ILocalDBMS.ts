import type { EventEmitter } from 'events';

export interface ILocalDBMS {
  ee: EventEmitter;
  database: any;
}
