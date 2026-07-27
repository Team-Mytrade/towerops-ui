import {
  DestroyRef,
  Directive,
  inject,
  signal
} from '@angular/core';
import {
  ActivatedRoute,
  Router
} from '@angular/router';
import {
  MonoTypeOperatorFunction
} from 'rxjs';
import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import { ToastService } from '../services/toast.service';
import { BaseClass } from './base.class';

@Directive()
export abstract class BaseComponent extends BaseClass {
  protected readonly router = inject(Router);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly toast = inject(ToastService);
  protected readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly pageError = signal<string | null>(null);

  protected setLoading(value: boolean): void {
    this.loading.set(value);
  }

  protected startLoading(): void {
    this.loading.set(true);
  }

  protected stopLoading(): void {
    this.loading.set(false);
  }

  protected setPageError(
    error: unknown,
    fallback?: string
  ): void {
    const message = this.getErrorMessage(
      error,
      fallback
    );

    this.pageError.set(message);
  }

  protected clearPageError(): void {
    this.pageError.set(null);
  }

  protected showError(
    error: unknown,
    fallback?: string
  ): void {
    this.toast.showApiError(error, fallback);
  }

  protected navigate(
    commands: unknown[],
    extras?: Parameters<Router['navigate']>[1]
  ): Promise<boolean> {
    return this.router.navigate(
      commands,
      extras
    );
  }

  protected navigateByUrl(url: string): Promise<boolean> {
    return this.router.navigateByUrl(url);
  }

  protected untilDestroyed<T>():
    MonoTypeOperatorFunction<T> {
    return takeUntilDestroyed<T>(this.destroyRef);
  }
}