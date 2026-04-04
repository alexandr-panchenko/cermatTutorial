/// <reference types="astro/client" />

export {};

declare global {
  interface DurableObjectState {
    storage: DurableObjectStorage;
  }

  interface DurableObjectStorage {
    get<T = unknown>(key: string): Promise<T | undefined>;
    put(key: string, value: unknown): Promise<void>;
  }

  interface DurableObjectNamespace {
    idFromName(name: string): DurableObjectId;
    get(id: DurableObjectId): DurableObjectStub;
  }

  interface DurableObjectId {}

  interface DurableObjectStub {
    fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
  }
}

declare namespace App {
  interface Locals {
    runtime?: {
      env?: {
        PROGRESS_HUB?: DurableObjectNamespace;
      };
    };
  }
}
