import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Fluid } from 'primeng/fluid';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';

import { AccountStore } from '../core/account.store';
import { DepositMethod } from '../core/models';

function toCents(euros: number): number {
  return Math.round(euros * 100);
}

const NOTES_MAX_LENGTH = 350;

@Component({
  selector: 'app-deposit-modal',
  imports: [
    ReactiveFormsModule,
    Dialog,
    Fluid,
    InputNumber,
    Select,
    Textarea,
    Button,
  ],
  templateUrl: './deposit-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepositModal {
  private readonly router = inject(Router);
  private readonly accountStore = inject(AccountStore);

  protected readonly notesMaxLength = NOTES_MAX_LENGTH;

  protected readonly depositMethods: { label: string; value: DepositMethod }[] = [
    { label: 'Card', value: 'Card' },
    { label: 'PayPal', value: 'PayPal' },
    { label: 'Wire Transfer', value: 'Wire Transfer' },
  ];

  protected readonly form = new FormGroup({
    amount: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0.01), Validators.max(10000)],
    }),
    method: new FormControl<DepositMethod | null>(null, {
      validators: [Validators.required],
    }),
    notes: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(NOTES_MAX_LENGTH)],
    }),
  });

  protected hasError(name: 'amount' | 'method' | 'notes'): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }
  protected amountMessage(): string {
    const errors = this.form.controls.amount.errors;
    if (errors?.['required']) {
      return 'Enter an amount.';
    }
    if (errors?.['min']) {
      return 'Amount must be greater than 0.';
    }
    if (errors?.['max']) {
      return 'Amount cannot exceed €10,000.';
    }
    return '';
  }

  /** Closing the dialog leaves /deposit, which destroys this view. Opening must not navigate. */
  protected onVisibleChange(open: boolean): void {
    if (!open) {
      this.leave();
    }
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { amount, method, notes } = this.form.getRawValue();

    if (amount == null || method == null) {
      return;
    }

    this.accountStore.makeDeposit({
      amount: toCents(amount),
      method,
      notes: notes.trim(),
    });
    this.leave();
  }

  private leave(): void {
    void this.router.navigate(['/'], { replaceUrl: true });
  }
}
