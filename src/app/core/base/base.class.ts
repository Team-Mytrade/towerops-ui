import { HttpErrorResponse } from '@angular/common/http';

export abstract class BaseClass {
  protected isNil(value: unknown): value is null | undefined {
    return value === null || value === undefined;
  }

  protected isEmpty(value: unknown): boolean {
    if (this.isNil(value)) {
      return true;
    }

    if (typeof value === 'string') {
      return value.trim().length === 0;
    }

    if (Array.isArray(value)) {
      return value.length === 0;
    }

    if (typeof value === 'object') {
      return Object.keys(value).length === 0;
    }

    return false;
  }

  protected normalizeText(value: unknown): string {
    if (this.isNil(value)) {
      return '';
    }

    return String(value).trim();
  }

  protected toNumber(
    value: unknown,
    fallback = 0
  ): number {
    const parsedValue = Number(value);

    return Number.isFinite(parsedValue)
      ? parsedValue
      : fallback;
  }

  protected getErrorMessage(
    error: unknown,
    fallback = 'Something went wrong. Please try again.'
  ): string {
    if (error instanceof HttpErrorResponse) {
      const apiMessage = error.error?.message;

      if (
        typeof apiMessage === 'string' &&
        apiMessage.trim()
      ) {
        return apiMessage;
      }

      if (typeof error.message === 'string' && error.message.trim()) {
        return error.message;
      }

      switch (error.status) {
        case 0:
          return 'Unable to connect to the server.';

        case 400:
          return 'The submitted information is invalid.';

        case 401:
          return 'Your session has expired. Please sign in again.';

        case 403:
          return 'You do not have permission to perform this action.';

        case 404:
          return 'The requested information could not be found.';

        case 409:
          return 'The request conflicts with existing information.';

        case 500:
          return 'The server encountered an unexpected error.';

        default:
          return fallback;
      }
    }

    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof error.message === 'string'
    ) {
      return error.message;
    }

    return fallback;
  }
}