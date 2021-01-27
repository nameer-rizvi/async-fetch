const { useState, useEffect } = require("react");
const { useInterval } = require("use-interval");

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

  const cancelActiveRequest = () =>
    controller && controller.abort && controller.abort();

  const handle = {
    start: (props) => {
      disableController !== true && cancelActiveRequest();
      (!props || (props && !props.excludePendingUpdate)) && setPending(true);
      setError();
      onStart && onStart();
    },
    initialResponse: (initialResponse) => {
      if (!initialResponse.ok) {
        throw Error(
          initialResponse.statusText || initialResponse.status.toString()
        );
      }
      return initialResponse[initialResponseParser]();
    },
    success: (parsedResponse) => {
      setData(parsedResponse);
      onSuccess && onSuccess(parsedResponse);
    },
    fail: (err) => {
      setError(err);
      onFail && onFail(err);
    },
    finish: () => {
      setPending();
      onFinish && onFinish();
    },
  };

  function sendRequest(props = {}) {
    !unmounted && handle.start(props);
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
    !unmounted &&
      fetch(url + query, options)
        .then((r) => !unmounted && handle.initialResponse(r))
        .then((r) => !unmounted && handle.success(r))
        .catch((e) => !unmounted && handle.fail(e))
        .finally(() => !unmounted && handle.finish());
  }

  // Removed !pending condition for allowing retries on stalled requests.
  const isValidRequest = url && !manual && condition !== false;

  useEffect(() => {
    !url && console.warn("[async-fetch] url is required.");
    isValidRequest && sendRequest();
    // eslint-disable-next-line
  }, useEffectDependency);

  useInterval(() => {
    isValidRequest && sendRequest({ excludePendingUpdate: true });
  }, poll);

  useEffect(
    () => () => {
      setUnmounted(true);
      disableController !== true && cancelActiveRequest();
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
