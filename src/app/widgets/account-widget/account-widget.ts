import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-account-widget',
  imports: [CurrencyPipe, Button],
  templateUrl: './account-widget.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountWidget {
  /** Balance in euro cents. */
  readonly balance = input.required<number>();
  readonly openDeposit = output<void>();
}
