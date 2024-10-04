interface RequestProps {
    initialPending?: boolean;
    initialData?: any;
    initialError?: any;
    deps?: string[];
    poll?: number;
    timeout?: number;
    ignoreRequest?: boolean;
    ignoreCleanup?: boolean;
    query?: any;
    params?: any;
    data?: any;
    parser?: "json" | "text" | "blob" | "formData" | "arrayBuffer";
    onStart?: () => void;
    onSuccess?: (data: any) => void;
    onFail?: (error: any) => void;
    onFinish?: () => void;
    headers?: Record<string, string>;
    body?: any;
    signal?: AbortSignal;
}
interface ResponseProps {
    pending?: boolean;
    data?: any;
    error?: any;
    sendRequest: () => void;
    cancelRequest: () => void;
}
declare function useAsyncFetch(stringUrl: string, props?: RequestProps): ResponseProps;
export default useAsyncFetch;
