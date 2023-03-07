import { useState, useEffect } from "react";
import useInterval from "./useInterval.js";

function useAsyncFetch(url, props = {}) {
  const {
    initialPending,
    initialData,
    initialError,
    deps = [],
    poll,
    ignoreCleanup,
    ignoreRequest,
    timeout = 30000,
    data: data2,
    query,
    params,
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

  useEffect(() => {
    sendRequest();
  }, [url, query, params, data2, ...deps]);

  useInterval(() => {
    sendRequest();
  }, poll);

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
    if (!url) throw new Error("URL is required.");

    if (typeof url !== "string") throw new Error("URL must be of type string.");

    if (ignoreRequest !== true) {
      const controller = new AbortController();

      fetchProps.signal = controller.signal;

      const requestTimeout = setTimeout(() => {
        controller.abort();
      }, timeout);

      try {
        const contentType =
          fetchProps.headers?.["Content-Type"] ||
          fetchProps.headers?.["content-type"];

        if (contentType === "application/x-www-form-urlencoded") {
          fetchProps.body = new URLSearchParams(data2 || {}).toString();
        } else if (data2) {
          fetchProps.body = JSON.stringify(data2);
        }

        if (query || params) {
          url += "?" + new URLSearchParams(query || params).toString();
        }

        if (!unmounted) {
          if (onStart) onStart();
          if (pending) {
            setPending2(true);
          } else setPending(true);
          setError();
          cancelRequest();
          setCancelSource(controller);
        }

        const response = await fetch(url, fetchProps);

        if (!response.ok)
          throw new Error(
            JSON.stringify({
              code: response.status,
              text: response.statusText,
              response: await response.text(),
            })
          );

        const parsedResponse = await response[parser]();

        if (!unmounted) {
          if (onSuccess) onSuccess(parsedResponse);
          setData(parsedResponse);
        }
      } catch (e) {
        if (!unmounted && e.name !== "AbortError") {
          let error;
          try {
            error = e.toString().replace("Error:", "");
            error = JSON.parse(error.trim());
          } catch {
            error = { response: e.toString(), text: e.toString() };
          }
          if (onFail) onFail(error);
          setError(error);
        }
      } finally {
        clearTimeout(requestTimeout);
        if (!unmounted) {
          if (onFinish) onFinish();
          if (pending) {
            setPending2();
          } else setPending();
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
