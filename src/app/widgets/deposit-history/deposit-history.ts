import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Deposit } from '../../core/models';
import { DepositHistoryItem } from '../deposit-history-item/deposit-history-item';

@Component({
  selector: 'app-deposit-history',
  imports: [DepositHistoryItem],
  templateUrl: './deposit-history.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'h-full' },
})
export class DepositHistory {
  readonly deposits = input.required<Deposit[]>();
  readonly storageError = input<string | null>(null);
}
