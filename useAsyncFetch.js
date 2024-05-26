import { useState, useEffect } from "react";
import useInterval from "./useInterval.js";

function useAsyncFetch(stringUrl, props = {}) {
  const {
    initialPending,
    initialData,
    initialError,
    deps = [],
    poll,
    timeout = 30000, // 30 seconds.
    ignoreCleanup,
    ignoreRequest,
    query,
    params,
    data: data2,
    parser = "json",
    onStart,
    onSuccess,
    onFail,
    onFinish,
    ...fetchProps
  } = props;

  const [pending, setPending] = useState(initialPending);

  const [pending2, setPending2] = useState();

  const [data, setData] = useState(initialData);

  const [error, setError] = useState(initialError);

  const [cancelSource, setCancelSource] = useState();

  const [unmounted, setUnmounted] = useState(false);

  useEffect(() => {
    return cleanupRequest;
  }, []);

  useEffect(sendRequest, [stringUrl, ...deps]);

  useInterval(sendRequest, poll);

  function cancelRequest() {
    if (cancelSource?.abort) cancelSource.abort();
  }

  function cleanupRequest() {
    if (ignoreCleanup !== true) {
      setUnmounted(true);
      cancelRequest();
    }
  }

  async function sendRequest() {
    if (!stringUrl) {
      throw new Error("URL is required.");
    }

    if (typeof stringUrl !== "string") {
      throw new Error("URL must be of type string.");
    }

    const url = new URL(stringUrl, window.location.origin);

    if (ignoreRequest !== true) {
      const controller = new AbortController();

      fetchProps.signal = controller.signal;

      const requestTimeout = setTimeout(() => {
        controller.abort();
      }, timeout);

      try {
        if (query || params) url.search = new URLSearchParams(query || params);

        const contentType =
          fetchProps.headers?.["Content-Type"] ||
          fetchProps.headers?.["content-type"];

        if (contentType === "application/x-www-form-urlencoded") {
          fetchProps.body = new URLSearchParams(data2 || {});
        } else if (data2) {
          fetchProps.body = JSON.stringify(data2);
        }

        if (!unmounted) {
          if (pending) setPending2(true);

          if (!pending) setPending(true);

          setError();

          cancelRequest();

          setCancelSource(controller);

          if (onStart) onStart();
        }

        const response = await fetch(url, fetchProps);

        if (!response.ok) {
          throw new Error(
            JSON.stringify({
              code: response.status,
              text: response.statusText,
              response: await response.text(),
            }),
          );
        }

        const parsedResponse = await response[parser]();

        if (!unmounted) {
          setData(parsedResponse);

          if (onSuccess) onSuccess(parsedResponse);
        }
      } catch (e) {
        if (!unmounted && e.name !== "AbortError") {
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

        if (!unmounted) {
          if (pending) {
            setPending2();
          } else {
            setPending();
          }

          if (onFinish) onFinish();
        }
      }
    }
  }

  return {
    pending: pending || pending2,
    data,
    error,
    sendRequest,
    cancelRequest,
  };
}

export default useAsyncFetch;
