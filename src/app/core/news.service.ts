import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { EMPTY, Observable, catchError, finalize, map, switchMap } from 'rxjs';

import { Article, NewsSort } from './models';

const NEWS_SORT_KEY = 'news-sort';
const ARTICLES_URL = 'https://api.spaceflightnewsapi.net/v4/articles/';

interface ArticleDto {
  id: number;
  title: string;
  url: string;
  news_site: string;
  summary: string;
  published_at: string;
}

interface ArticlesResponse {
  results: ArticleDto[];
}

function readSort(): NewsSort {
  try {
    return localStorage.getItem(NEWS_SORT_KEY) === 'oldest' ? 'oldest' : 'newest';
  } catch {
    return 'newest';
  }
}

function parseArticles(response: ArticlesResponse): Article[] {
  return response.results.map((item) => ({
    id: item.id,
    title: item.title,
    url: item.url,
    source: item.news_site,
    summary: item.summary,
    publishedAt: item.published_at,
  }));
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error('Failed to load news');
}

@Injectable({ providedIn: 'root' })
export class NewsService {
  private readonly http = inject(HttpClient);
  private readonly sortState = signal<NewsSort>(readSort());
  private readonly attemptState = signal(0);
  private readonly request = computed(() => ({
    sort: this.sortState(),
    attempt: this.attemptState(),
  }));
  private readonly articlesState = signal<Article[]>([]);
  private readonly loadingState = signal(true);
  private readonly errorState = signal<Error | null>(null);

  readonly sort = this.sortState.asReadonly();
  readonly articles = this.articlesState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(NEWS_SORT_KEY, this.sortState());
      } catch {
        // Ignore storage failures in private browsing.
      }
    });

    // Refetch when the sort or an explicit retry changes. switchMap drops a stale response.
    toObservable(this.request)
      .pipe(
        switchMap(({ sort }) => this.fetchArticles(sort)),
        takeUntilDestroyed(),
      )
      .subscribe((articles) => this.articlesState.set(articles));
  }

  setSort(sort: NewsSort): void {
    this.sortState.set(sort);
  }

  reload(): void {
    this.attemptState.update((attempt) => attempt + 1);
  }

  private fetchArticles(sort: NewsSort): Observable<Article[]> {
    this.loadingState.set(true);
    this.errorState.set(null);

    return this.http
      .get<ArticlesResponse>(ARTICLES_URL, {
        params: {
          limit: 25,
          ordering: sort === 'newest' ? '-published_at' : 'published_at',
        },
      })
      .pipe(
        map((response) => parseArticles(response)),
        catchError((error: unknown) => {
          this.errorState.set(toError(error));
          return EMPTY;
        }),
        finalize(() => this.loadingState.set(false)),
      );
  }
}
