const { useState, useEffect } = require("react");

let controller;

function useAsyncFetch(props) {
  let {
    initialPending,
    initialError,
    initialData,
    useEffectDependency = [],
    manual,
    condition,
    method = "GET",
    query,
    data: body,
    onStart,
    onSuccess,
    onFail,
    onFinish,
    initialResponseParser = "json",
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
    start: () => {
      cancelActiveRequest();
      setPending(true);
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

  function sendRequest() {
    !unmounted && handle.start();
    query = query ? "?" + new URLSearchParams(query).toString() : "";
    controller = new AbortController();
    const options = {
      method,
      signal: controller && controller.signal,
      body: body && JSON.stringify(body),
      ...fetchOptions,
    };
    !unmounted &&
      fetch(url + query, options)
        .then((r) => !unmounted && handle.initialResponse(r))
        .then((r) => !unmounted && handle.success(r))
        .catch((e) => !unmounted && handle.fail(e))
        .finally(() => !unmounted && handle.finish());
  }

  useEffect(() => {
    !url && console.warn("[async-fetch] url is required.");
    !unmounted &&
      url &&
      !manual &&
      !pending &&
      condition !== false &&
      sendRequest();
    // eslint-disable-next-line
  }, useEffectDependency);

  // eslint-disable-next-line
  useEffect(
    () => () => {
      setUnmounted(true);
      cancelActiveRequest();
    },
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
