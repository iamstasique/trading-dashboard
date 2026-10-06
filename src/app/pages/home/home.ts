import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet } from '@angular/router';
import { Drawer } from 'primeng/drawer';
import { map } from 'rxjs';

import { AccountStore } from '../../core/account.store';
import { NewsService } from '../../core/news.service';
import { Header } from '../../layout/header/header';
import { AccountWidget } from '../../widgets/account-widget/account-widget';
import { DepositHistory } from '../../widgets/deposit-history/deposit-history';
import { NewsWidget } from '../../widgets/news-widget/news-widget';

/** Same cutoff as Tailwind's `lg` screen. */
const DESKTOP_QUERY = '(min-width: 1024px)';

@Component({
  selector: 'app-home',
  imports: [RouterOutlet, Drawer, Header, AccountWidget, DepositHistory, NewsWidget],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
})
export class HomePage {
  private readonly router = inject(Router);
  private readonly layout = inject(BreakpointObserver);
  protected readonly accountStore = inject(AccountStore);
  protected readonly news = inject(NewsService);
  protected readonly newsOpen = signal(false);
  protected readonly desktop = toSignal(
    this.layout.observe(DESKTOP_QUERY).pipe(map((state) => state.matches)),
    { initialValue: this.layout.isMatched(DESKTOP_QUERY) },
  );

  constructor() {
    effect(() => {
      if (this.desktop()) {
        this.newsOpen.set(false);
      }
    });
  }

  protected openDeposit(): void {
    void this.router.navigate(['/deposit']);
  }
}
