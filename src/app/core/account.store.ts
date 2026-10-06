import { computed, inject, Injectable, signal } from '@angular/core';

import { DepositHistoryDb } from './deposit-history.db';
import { Deposit, DepositMethod } from './models';

type DepositEntry = Pick<Deposit, 'amount' | 'method' | 'notes'>;

/** €1,000 in cents. Balance is this plus every stored deposit. */
const INITIAL_BALANCE_CENTS = 100000;
const MIN_CENTS = 1;
const MAX_CENTS = 1000000;
const NOTES_MAX_LENGTH = 350;
const DEPOSIT_METHODS = new Set<DepositMethod>(['Card', 'PayPal', 'Wire Transfer']);

const LOAD_ERROR = 'Saved deposits could not be loaded.';
const SAVE_ERROR = 'This deposit is not saved and will be lost on refresh.';

/** Appends stored deposits whose ids are not already in memory. */
function mergeDeposits(current: Deposit[], stored: Deposit[]): Deposit[] {
  const ids = new Set(current.map((item) => item.id));
  return [...current, ...stored.filter((item) => !ids.has(item.id))];
}

function isValidDeposit(entry: DepositEntry): boolean {
  return (
    Number.isInteger(entry.amount) &&
    entry.amount >= MIN_CENTS &&
    entry.amount <= MAX_CENTS &&
    DEPOSIT_METHODS.has(entry.method) &&
    entry.notes.length <= NOTES_MAX_LENGTH
  );
}

@Injectable({ providedIn: 'root' })
export class AccountStore {
  private readonly depositHistoryDb = inject(DepositHistoryDb);
  private readonly depositsState = signal<Deposit[]>([]);
  private readonly storageErrorState = signal<string | null>(null);
  private depositHistoryQueue: Promise<void> = Promise.resolve();

  readonly deposits = this.depositsState.asReadonly();
  readonly storageError = this.storageErrorState.asReadonly();
  readonly balance = computed(
    () => INITIAL_BALANCE_CENTS + this.depositsState().reduce((sum, item) => sum + item.amount, 0),
  );

  /** Loads saved deposits once and merges them into memory. Later writes wait on this promise. */
  loadDepositHistory(): Promise<void> {
    this.depositHistoryQueue = this.depositHistoryDb
      .load()
      .then((storedDeposits) => {
        this.depositsState.update((currentDeposits) =>
          mergeDeposits(currentDeposits, storedDeposits),
        );
      })
      // A rejection here would stall every later write chained onto this promise.
      .catch(() => {
        this.storageErrorState.set(LOAD_ERROR);
      });

    return this.depositHistoryQueue;
  }

  /**
   * Adds a deposit to memory immediately, then saves it after any in-flight load or write.
   * `amount` is integer euro cents. Invalid entries are ignored.
   */
  makeDeposit(entry: DepositEntry): void {
    if (!isValidDeposit(entry)) {
      return;
    }

    const deposit: Deposit = {
      id: crypto.randomUUID(),
      date: new Date(),
      amount: entry.amount,
      method: entry.method,
      notes: entry.notes,
    };

    this.depositsState.update((deposits) => [deposit, ...deposits]);
    this.depositHistoryQueue = this.depositHistoryQueue
      .catch(() => undefined)
      // `.then` always defers add, even when the queue is already resolved.
      .then(() => this.depositHistoryDb.add(deposit))
      .catch(() => {
        this.storageErrorState.set(SAVE_ERROR);
      });
  }
}
