import { Injectable } from '@angular/core';

import { Deposit } from './models';

const DB_NAME = 'trading-dashboard';
const DB_VERSION = 1;
const STORE_NAME = 'deposits';

/** Resolves with the request result, or rejects with its error. */
function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
  });
}

/** Opens the database and creates the deposits store on first run. */
function openDatabase(): Promise<IDBDatabase> {
  const request = indexedDB.open(DB_NAME, DB_VERSION);

  request.onupgradeneeded = () => {
    const database = request.result;
    if (!database.objectStoreNames.contains(STORE_NAME)) {
      database.createObjectStore(STORE_NAME, { keyPath: 'id' });
    }
  };

  return requestToPromise(request);
}

@Injectable({ providedIn: 'root' })
export class DepositHistoryDb {
  /** Returns saved deposits, newest first. Rejects when IndexedDB fails. */
  load(): Promise<Deposit[]> {
    return this.readAll();
  }

  /** Stores a deposit. Rejects when the write fails. */
  add(deposit: Deposit): Promise<void> {
    return this.write(deposit);
  }

  /** Reads every deposit and sorts them from newest to oldest. */
  private async readAll(): Promise<Deposit[]> {
    const database = await openDatabase();

    try {
      const store = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME);
      const records = await requestToPromise(store.getAll());
      return records.sort((left, right) => right.date.getTime() - left.date.getTime());
    } finally {
      database.close();
    }
  }

  /** Inserts or replaces a deposit by its id. */
  private async write(deposit: Deposit): Promise<void> {
    const database = await openDatabase();

    try {
      const store = database.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME);
      await requestToPromise(store.put(deposit));
    } finally {
      database.close();
    }
  }
}
