export interface ApiResponse {
    status: boolean;
    message: string;
    data: string;
}

export interface ApiListResponse<T> {
  success: string;
  statusCode: string;
  message: string;
  error?: ApiErrorResponse;
  result?: ListItemsResponse<T>;
}

export interface ListItemsResponse<T> {
  total: number;
  items: T;
}

export interface ApiErrorResponse {
  message: string;
}
