export type DepositMethod = 'Card' | 'PayPal' | 'Wire Transfer';

export interface Deposit {
  id: string;
  date: Date;
  /** Integer euro cents. */
  amount: number;
  method: DepositMethod;
  notes: string;
}

export type NewsSort = 'newest' | 'oldest';

export interface Article {
  id: number;
  title: string;
  url: string;
  source: string;
  summary: string;
  publishedAt: string;
}
