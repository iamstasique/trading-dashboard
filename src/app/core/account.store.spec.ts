import { TestBed } from '@angular/core/testing';

import { AccountStore } from './account.store';
import { DepositHistoryDb } from './deposit-history.db';
import { Deposit } from './models';

const STARTING_BALANCE = 100000;

/** Saving finishes on a promise, so the test waits one tick before checking the database. */
function waitForSave(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/** Builds a store with a fake database. Each test describes only what that database does. */
function createStore(db: Pick<DepositHistoryDb, 'load' | 'add'>): AccountStore {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [{ provide: DepositHistoryDb, useValue: db }],
  });
  return TestBed.inject(AccountStore);
}

describe('AccountStore', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts at €1,000 with no deposits', () => {
    const store = createStore({
      load: () => Promise.resolve([]),
      add: () => Promise.resolve(),
    });

    expect(store.balance()).toBe(STARTING_BALANCE);
    expect(store.deposits()).toEqual([]);
    expect(store.storageError()).toBeNull();
  });

  it('adds a deposit to the balance immediately and saves it afterwards', async () => {
    const saved: Deposit[] = [];
    const store = createStore({
      load: () => Promise.resolve([]),
      add: (deposit) => {
        saved.push(deposit);
        return Promise.resolve();
      },
    });

    store.makeDeposit({ amount: 10000, method: 'Card', notes: 'first' });
    store.makeDeposit({ amount: 4050, method: 'Wire Transfer', notes: '' });

    expect(store.balance()).toBe(STARTING_BALANCE + 10000 + 4050);
    expect(store.deposits().map((item) => item.method)).toEqual(['Wire Transfer', 'Card']);

    await waitForSave();
    expect(saved.map((item) => item.method)).toEqual(['Card', 'Wire Transfer']);
  });

  it('restores saved deposits into the balance', async () => {
    const stored: Deposit = {
      id: 'saved-deposit',
      date: new Date('2026-02-02T00:00:00.000Z'),
      amount: 2500,
      method: 'PayPal',
      notes: 'saved',
    };
    const store = createStore({
      load: () => Promise.resolve([stored]),
      add: () => Promise.resolve(),
    });

    await store.loadDepositHistory();

    expect(store.deposits()).toEqual([stored]);
    expect(store.balance()).toBe(STARTING_BALANCE + 2500);
  });

  it('keeps the balance when the database rejects the save', async () => {
    const store = createStore({
      load: () => Promise.resolve([]),
      add: () => Promise.reject(new Error('disk full')),
    });

    store.makeDeposit({ amount: 500, method: 'Card', notes: '' });
    await waitForSave();

    expect(store.balance()).toBe(STARTING_BALANCE + 500);
    expect(store.deposits()).toHaveLength(1);
    expect(store.storageError()).toBe('This deposit is not saved and will be lost on refresh.');
  });

  it('ignores an amount that is not between 1 cent and €10,000', () => {
    const store = createStore({
      load: () => Promise.resolve([]),
      add: () => Promise.resolve(),
    });

    store.makeDeposit({ amount: 0, method: 'Card', notes: '' });
    store.makeDeposit({ amount: 1_000_000_1, method: 'Card', notes: '' });

    expect(store.balance()).toBe(STARTING_BALANCE);
    expect(store.deposits()).toEqual([]);
  });
});
