import { useState, useEffect } from "react";
import useCache from "./useCache.js";
import useInterval from "./useInterval.js";

function useAsyncFetch(path, props = {}) {
  const {
    initialPending,
    initialData,
    initialError,
    deps = [],
    poll,
    cachetime = 60000, // 1 minute.
    timeout = 30000, // 5 minutes.
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

  const cache = useCache(cachetime);

  useEffect(() => {
    return cleanupRequest;
  }, []);

  useEffect(() => {
    sendRequest();
  }, [path, ...deps]);

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
    if (!path) throw new Error("URL is required.");

    if (typeof path !== "string")
      throw new Error("URL must be of type string.");

    if (ignoreRequest !== true) {
      const controller = new AbortController();

      fetchProps.signal = controller.signal;

      const requestTimeout = setTimeout(() => {
        controller.abort();
      }, timeout);

      try {
        let q = "";

        if (query || params) {
          if (!path.endsWith("?")) q += "?";
          q += new URLSearchParams(query || params).toString();
        }

        const contentType =
          fetchProps.headers?.["Content-Type"] ||
          fetchProps.headers?.["content-type"];

        if (contentType === "application/x-www-form-urlencoded") {
          fetchProps.body = new URLSearchParams(data2 || {}).toString();
        } else if (data2) {
          fetchProps.body = JSON.stringify(data2);
        }

        if (!unmounted) {
          if (pending) {
            setPending2(true);
          } else setPending(true);
          setError();
          cancelRequest();
          setCancelSource(controller);
          if (onStart) onStart();
        }

        const url = path + q;

        const cachedResponse = cache.get(url, fetchProps);

        let parsedResponse = cachedResponse;

        if (!parsedResponse) {
          const response = await fetch(url, fetchProps);

          if (!response.ok)
            throw new Error(
              JSON.stringify({
                code: response.status,
                text: response.statusText,
                response: await response.text(),
              })
            );

          parsedResponse = await response[parser]();
        }

        if (!unmounted) {
          setData(parsedResponse);
          if (onSuccess) onSuccess(parsedResponse);
          if (!cachedResponse) cache.set(url, fetchProps, parsedResponse);
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
          setError(error);
          if (onFail) onFail(error);
        }
      } finally {
        clearTimeout(requestTimeout);
        if (!unmounted) {
          if (pending) {
            setPending2();
          } else setPending();
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
