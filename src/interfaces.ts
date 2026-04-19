export interface FetchError {
  status: number;
  statusText: string;
  response: string;
}

export interface RequestProps<T, E> extends RequestInit {
  initialPending?: boolean;
  initialError?: E;
  initialData?: T;
  auto?: boolean;
  poll?: number;
  timeout?: number;
  ignoreRequest?: boolean;
  ignoreCleanup?: boolean;
  query?: Record<string, string>;
  params?: Record<string, string>;
  data?: unknown;
  parser?: "json" | "text" | "blob" | "formData" | "arrayBuffer";
  onStart?: () => void;
  onSuccess?: (data: T) => void;
  onFail?: (error: E) => void;
  onFinish?: () => void;
}

export interface ResponseProps<T, E> {
  pending: boolean;
  error?: E;
  data?: T;
  sendRequest: () => Promise<void>;
  cancelRequest: () => void;
}
