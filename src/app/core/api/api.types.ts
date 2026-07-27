export interface ApiResponse<T> {
  timestamp: number;
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  timestamp?: number;
  success?: false;
  message: string;
  status?: number;
  errorCode?: string;
  path?: string;
  fieldErrors?: Record<string, string>;
}

export interface PageRequest {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

