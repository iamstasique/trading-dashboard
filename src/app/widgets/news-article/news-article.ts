import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Article } from '../../core/models';

@Component({
  selector: 'app-news-article',
  imports: [DatePipe],
  templateUrl: './news-article.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsArticle {
  readonly article = input.required<Article>();
}
