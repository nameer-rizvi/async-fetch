import { useState, useCallback, useEffect } from "react";
import useInterval from "./useInterval.js";

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

function useAsyncFetch(
  stringUrl: string,
  props: RequestProps = {},
): ResponseProps {
  const {
    initialPending,
    initialData,
    initialError,
    deps = [],
    poll,
    timeout = 30000, // 30 seconds.
    ignoreRequest,
    ignoreCleanup,
    query,
    params,
    data: body,
    parser = "json",
    onStart,
    onSuccess,
    onFail,
    onFinish,
    ...fetchProps
  } = props;

  const [pending, setPending] = useState<boolean | undefined>(initialPending);

  const [pending2, setPending2] = useState<boolean | undefined>(initialPending);

  const [data, setData] = useState<any>(initialData);

  const [error, setError] = useState<any>(initialError);

  const [cancelSource, setCancelSource] = useState<
    AbortController | undefined
  >();
  const cancelRequest = useCallback(() => {
    if (cancelSource?.abort) cancelSource.abort();
  }, [cancelSource]);

  const sendRequest = useCallback(async () => {
    if (ignoreRequest === true) return;

    const url = new URL(stringUrl, window.location.origin);

    if (query || params) {
      url.search = new URLSearchParams(query || params || {}).toString();
    }

    const contentType =
      fetchProps.headers?.["Content-Type"] ||
      fetchProps.headers?.["content-type"];

    if (contentType === "application/x-www-form-urlencoded") {
      fetchProps.body = new URLSearchParams(body || {});
    } else if (body) {
      fetchProps.body = JSON.stringify(body);
    }

    const controller = new AbortController();

    const requestTimeout = setTimeout(() => controller.abort(), timeout);

    fetchProps.signal = controller.signal;

    if (pending) setPending2(true);

    if (!pending) setPending(true);

    setError(undefined);

    cancelRequest();

    setCancelSource(controller);

    if (onStart) onStart();

    try {
      const response = await fetch(url, fetchProps);

      if (!response.ok) {
        throw new Error(
          JSON.stringify({
            code: response.status,
            text: response.statusText,
            response: await response.text(),
          }),
        );
      } else {
        const parsedResponse = await response[parser]();

        setData(parsedResponse);

        if (onSuccess) onSuccess(parsedResponse);
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        let error;

        try {
          error = JSON.parse(e.toString().replace("Error:", "").trim());
        } catch {
          error = { response: e.toString(), text: e.toString() };
        }

        setError(error);

        if (onFail) onFail(error);
      }
    } finally {
      clearTimeout(requestTimeout);

      if (pending) {
        setPending2(undefined);
      } else {
        setPending(undefined);
      }

      if (onFinish) onFinish();
    }
  }, [
    ignoreRequest,
    stringUrl,
    query,
    params,
    fetchProps,
    body,
    timeout,
    parser,
    onStart,
    onSuccess,
    onFail,
    onFinish,
  ]);

  useEffect(() => {
    sendRequest();
  }, deps);

  useInterval(() => {
    sendRequest();
  }, poll);

  useEffect(() => {
    return () => {
      if (ignoreCleanup !== true) cancelRequest();
    };
  }, []);

  return {
    pending: pending || pending2,
    data,
    error,
    sendRequest,
    cancelRequest,
  };
}

export default useAsyncFetch;
