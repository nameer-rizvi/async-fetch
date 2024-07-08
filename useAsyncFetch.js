import { useState, useCallback, useEffect } from "react";
import useInterval from "./useInterval.js";

function useAsyncFetch(stringUrl, props = {}) {
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

  const [pending, setPending] = useState(initialPending);

  const [pending2, setPending2] = useState(initialPending);

  const [data, setData] = useState(initialData);

  const [error, setError] = useState(initialError);

  const [cancelSource, setCancelSource] = useState();

  const cancelRequest = useCallback(() => {
    if (cancelSource?.abort) cancelSource.abort();
  }, [cancelSource]);

  const sendRequest = useCallback(async () => {
    if (ignoreRequest === true) return;

    const url = new URL(stringUrl, window.location.origin);

    if (query || params) url.search = new URLSearchParams(query || params);

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

    setError();

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
    } catch (e) {
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
        setPending2();
      } else {
        setPending();
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
