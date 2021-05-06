const { useState, useEffect } = require("react");
const useInterval = require("./useInterval");

let controller;

function useAsyncFetch(props, fetchProps) {
  let {
    initialPending,
    initialError,
    initialData,
    useEffectDependency = [],
    disableController,
    poll = null,
    manual,
    condition,
    method = "GET",
    query,
    data: bodyData,
    initialResponseParser = "json",
    onStart,
    onSuccess,
    onFail,
    onFinish,
    ...fetchOptions
  } = props && props.constructor === Object ? props : {};

  const url =
    props &&
    ((props.constructor === Object && props.url) ||
      (props.constructor === String && props));

  const [pending, setPending] = useState(initialPending);
  const [error, setError] = useState(initialError);
  const [data, setData] = useState(initialData);
  const [unmounted, setUnmounted] = useState();

  function cancelActiveRequest() {
    if (controller && controller.abort) controller.abort();
  }

  function sendRequest(props = {}) {
    if (url && condition !== false && !unmounted) {
      if (disableController !== true) cancelActiveRequest();

      if (!props.excludePendingUpdate) setPending(true);

      setError();

      if (onStart) onStart();

      query = query ? "?" + new URLSearchParams(query).toString() : "";

      controller = new AbortController();

      const options = {
        method,
        signal: controller && controller.signal,
        ...fetchOptions,
        body:
          (bodyData || fetchOptions.body) &&
          JSON.stringify({ ...bodyData, ...fetchOptions.body }),
        ...fetchProps,
      };

      fetch(url + query, options)
        .then((initialResponse) => {
          if (!unmounted) {
            if (!initialResponse.ok) {
              const throwError =
                initialResponse.statusText || initialResponse.status.toString();
              throw Error(throwError);
            }
            return initialResponse[initialResponseParser]();
          }
        })
        .then((parsedResponse) => {
          if (!unmounted) {
            setData(parsedResponse);
            if (onSuccess) onSuccess(parsedResponse);
          }
        })
        .catch((responseError) => {
          if (!unmounted) {
            setError(responseError);
            if (onFail) onFail(responseError);
          }
        })
        .finally(() => {
          if (!unmounted) {
            setPending();
            if (onFinish) onFinish();
          }
        });
    }
  }

  useEffect(() => {
    if (!url) console.warn("[async-fetch] url is required.");
    if (!manual) sendRequest();
    // eslint-disable-next-line
  }, useEffectDependency);

  useInterval(() => {
    sendRequest({ excludePendingUpdate: true });
  }, poll);

  useEffect(
    () => () => {
      setUnmounted(true);
      if (disableController !== true) cancelActiveRequest();
    },
    // eslint-disable-next-line
    []
  );

  return {
    pending,
    error,
    data,
    setPending,
    setError,
    setData,
    cancelRequest: cancelActiveRequest,
    sendRequest,
  };
}

module.exports = useAsyncFetch;
