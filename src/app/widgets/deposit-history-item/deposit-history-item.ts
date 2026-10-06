import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Deposit } from '../../core/models';

@Component({
  selector: 'app-deposit-history-item',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './deposit-history-item.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepositHistoryItem {
  readonly deposit = input.required<Deposit>();
}
