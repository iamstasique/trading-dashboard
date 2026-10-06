import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { SelectButton } from 'primeng/selectbutton';

import { Article, NewsSort } from '../../core/models';
import { NewsArticle } from '../news-article/news-article';

@Component({
  selector: 'app-news-widget',
  imports: [FormsModule, SelectButton, Button, NewsArticle],
  templateUrl: './news-widget.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsWidget {
  readonly articles = input.required<Article[]>();
  readonly sort = input.required<NewsSort>();
  readonly loading = input(false);
  readonly errorMessage = input<string | null>(null);
  readonly showHeading = input(true);

  readonly sortChange = output<NewsSort>();
  readonly retry = output<void>();

  protected readonly newsSortOptions: { label: string; value: NewsSort }[] = [
    { label: 'Newest', value: 'newest' },
    { label: 'Oldest', value: 'oldest' },
  ];

  protected onNewsSortChange(value: NewsSort): void {
    this.sortChange.emit(value);
  }
}
