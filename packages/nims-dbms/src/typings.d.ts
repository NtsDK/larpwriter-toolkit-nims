declare module 'events' {
  export class EventEmitter {
    on(event: string, listener: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): boolean;
    removeAllListeners(event?: string): this;
  }
}

declare module 'crypto' {
  export function createHmac(algorithm: string, key: string): {
    update(data: string): { digest(encoding: string): string };
  };
}

declare function structuredClone<T>(value: T): T;

