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

  function cancelRequest(SOURCE) {
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

    const controller = new AbortController();

    fetchProps.signal = controller.signal;

    const requestTimeout = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      if (ignoreRequest !== true) {
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
          if (setPending) setPending(true);
          if (setError) setError();
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
          setData(parsedResponse);
          if (onSuccess) onSuccess(parsedResponse);
        }
      }
    } catch (error) {
      if (!unmounted && error.name !== "AbortError") {
        let errorJson;
        try {
          errorJson = error.toString().replace("Error:", "");
          errorJson = JSON.parse(errorJson.trim());
        } catch {}
        setError(errorJson || error);
        if (onFail) onFail(errorJson || error);
      }
    } finally {
      clearTimeout(requestTimeout);
      if (!unmounted) {
        setCancelSource();
        if (setPending) setPending();
        if (onFinish) onFinish();
      }
    }
  }

  return { pending, data, error, sendRequest, cancelRequest };
}

export default useAsyncFetch;
