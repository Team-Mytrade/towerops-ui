import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

import { BaseClass } from '../base/base.class';
import { ToastType } from '../models/toast-type.enum';

export interface ToastOptions {
  summary?: string;
  life?: number;
  sticky?: boolean;
  key?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService extends BaseClass {
  private readonly messageService = inject(MessageService);

  show(
    detail: string,
    type: ToastType = ToastType.INFO,
    options?: ToastOptions
  ): void {
    this.messageService.add({
      severity: type,
      summary: options?.summary ?? this.getDefaultSummary(type),
      detail,
      life: options?.life ?? 4000,
      sticky: options?.sticky ?? false,
      key: options?.key
    });
  }

  success(
    detail: string,
    options?: ToastOptions
  ): void {
    this.show(detail, ToastType.SUCCESS, {
      summary: 'Success',
      ...options
    });
  }

  error(
    detail: string,
    options?: ToastOptions
  ): void {
    this.show(detail, ToastType.ERROR, {
      summary: 'Error',
      life: 6000,
      ...options
    });
  }

  info(
    detail: string,
    options?: ToastOptions
  ): void {
    this.show(detail, ToastType.INFO, {
      summary: 'Information',
      ...options
    });
  }

  warning(
    detail: string,
    options?: ToastOptions
  ): void {
    this.show(detail, ToastType.WARN, {
      summary: 'Warning',
      ...options
    });
  }

  showApiError(
    error: unknown,
    fallback?: string
  ): void {
    this.error(
      this.getErrorMessage(
        error,
        fallback ?? 'The requested operation could not be completed.'
      )
    );
  }

  clear(key?: string): void {
    this.messageService.clear(key);
  }

  private getDefaultSummary(type: ToastType): string {
    switch (type) {
      case ToastType.SUCCESS:
        return 'Success';

      case ToastType.ERROR:
        return 'Error';

      case ToastType.WARN:
        return 'Warning';

      case ToastType.INFO:
      default:
        return 'Information';
    }
  }
}