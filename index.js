const { useState, useEffect } = require("react");

function useAsyncFetch({
  initialPending,
  initialError,
  initialData,
  useEffectDependency,
  manual,
  condition,
  url,
  method = "GET",
  query,
  data: body,
  onStart,
  onSuccess,
  onFail,
  onFinish,
  initialResponseParser = "json",
  ...fetchOptions
}) {
  const [pending, setPending] = useState(initialPending);
  const [error, setError] = useState(initialError);
  const [data, setData] = useState(initialData);
  const [unmounted, setUnmounted] = useState();

  const handle = {
    start: () => {
      setPending(true);
      setError();
      onStart && onStart();
    },
    initialResponse: (initialResponse) => {
      if (!initialResponse.ok) {
        throw new Error(initialResponse.status);
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
    query = query ? "?" + new URLSearchParams(query) : "";
    const options = {
      method,
      body: body && JSON.stringify(body),
      ...fetchOptions,
    };
    fetch(url + query, options)
      .then((r) => !unmounted && handle.initialResponse(r))
      .then((r) => !unmounted && handle.success(r))
      .catch((e) => !unmounted && handle.fail(e))
      .finally(() => !unmounted && handle.finish());
  }

  const useEffectDependencyIsArray =
    useEffectDependency && useEffectDependency.constructor === Array;

  useEffectDependency = useEffectDependencyIsArray ? useEffectDependency : [];

  !useEffectDependencyIsArray &&
    console.warn(
      "[async-fetch] useEffectDependency must be an array. Using empty array as a substitute."
    );

  useEffect(() => {
    !url && console.warn("[async-fetch] url is required.");
    !unmounted &&
      url &&
      !manual &&
      !pending &&
      condition !== false &&
      sendRequest();
  }, useEffectDependency);

  const cancelRequest = () => setUnmounted(true);

  useEffect(() => {
    () => cancelRequest();
  }, []);

  return {
    pending,
    error,
    data,
    setPending,
    setError,
    setData,
    sendRequest,
    cancelRequest,
  };
}

module.exports = useAsyncFetch;
