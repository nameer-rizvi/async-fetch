import {
  type FetchError,
  type RequestProps,
  type ResponseProps,
} from "./interfaces.js";
import { useState, useRef, useCallback, useEffect } from "react";
import useInterval from "./useInterval.js";
import normalizeError from "./normalizeError.js";

/**
 * A React hook for managing async fetch requests with built-in state, cancellation, and polling.
 * @example
 * // Auto-fetch on mount:
 * const { pending, error, data } = useAsyncFetch<User>("/api/user/1");
 *
 * // Manual trigger:
 * const { pending, error, data, sendRequest } = useAsyncFetch<User>("/api/user/1", { auto: false });
 * <button onClick={sendRequest}>Fetch</button>
 *
 * // With polling:
 * const { data } = useAsyncFetch<Status>("/api/status", { poll: 5000 });
 *
 * // POST with JSON body:
 * const { pending, error, data } = useAsyncFetch<Response>("/api/submit", {
 *   method: "POST",
 *   data: { name: "foo" },
 * });
 *
 * // With callbacks:
 * useAsyncFetch<User>("/api/user/1", {
 *   onStart: () => console.log("started"),
 *   onSuccess: (data) => console.log(data),
 *   onFail: (error) => console.error(error),
 *   onFinish: () => console.log("finished"),
 * });
 *
 * // Cancel on demand:
 * const { cancelRequest } = useAsyncFetch<User>("/api/user/1");
 * <button onClick={cancelRequest}>Cancel</button>
 */
function useAsyncFetch<T = unknown, E = FetchError>(
  urlString: string,
  props: RequestProps<T, E> = {},
): ResponseProps<T, E> {
  const {
    initialPending = false,
    initialError,
    initialData,
    auto = true,
    poll,
    timeout = 30000,
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
    ...fetchOptions
  } = props;

  const [pending, setPending] = useState(initialPending);

  const [error, setError] = useState(initialError);

  const [data, setData] = useState(initialData);

  const fetchOptionsRef = useRef(fetchOptions);

  const controllerRef = useRef<AbortController | null>(null);

  const requestIdRef = useRef(0);

  fetchOptionsRef.current = fetchOptions;

  const cancelRequest = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, []);

  const sendRequest = useCallback(async () => {
    if (ignoreRequest === true) return;

    cancelRequest();

    setPending(true);

    setError(undefined);

    if (onStart) onStart();

    const controller = new AbortController();

    controllerRef.current = controller;

    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const requestId = ++requestIdRef.current;

    try {
      const url = new URL(urlString, window.location.origin);

      if (query ?? params) {
        url.search = new URLSearchParams({ ...query, ...params }).toString();
      }

      const headers = new Headers(fetchOptionsRef.current.headers);

      let resolvedBody: BodyInit | undefined;

      if (headers.get("content-type") === "application/x-www-form-urlencoded") {
        resolvedBody = new URLSearchParams(
          (body as Record<string, string>) ?? {},
        );
      } else if (body instanceof FormData || body instanceof Blob) {
        resolvedBody = body;
      } else if (body !== undefined) {
        resolvedBody = JSON.stringify(body);
      }

      const response = await fetch(url, {
        ...fetchOptionsRef.current,
        headers,
        body: resolvedBody ?? fetchOptionsRef.current.body,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw Object.assign(new Error(response.statusText), {
          status: response.status,
          statusText: response.statusText,
          response: await response.text(),
        });
      }

      const parsedResponse = (await response[parser]()) as T;

      setData(parsedResponse);

      if (onSuccess) onSuccess(parsedResponse);
    } catch (err) {
      if ((err as { name?: string })?.name !== "AbortError") {
        const normalizedError = normalizeError<E>(err);
        setError(normalizedError);
        if (onFail) onFail(normalizedError);
      }
    } finally {
      clearTimeout(timeoutId);
      if (requestId === requestIdRef.current) {
        setPending(false);
        if (onFinish) onFinish();
      }
    }
  }, [
    ignoreRequest,
    cancelRequest,
    timeout,
    urlString,
    query,
    params,
    body,
    parser,
    onStart,
    onSuccess,
    onFail,
    onFinish,
  ]);

  useEffect(() => {
    if (auto === true) void sendRequest();
  }, [auto, sendRequest]);

  useInterval(() => {
    void sendRequest();
  }, poll);

  useEffect(() => {
    return () => {
      if (ignoreCleanup !== true) cancelRequest();
    };
  }, [ignoreCleanup, cancelRequest]);

  return { pending, error, data, cancelRequest, sendRequest };
}

export default useAsyncFetch;
