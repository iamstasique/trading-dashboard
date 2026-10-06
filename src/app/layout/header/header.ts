import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-header',
  imports: [Button],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  readonly openNews = output<void>();
}
