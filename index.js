const { useState, useEffect } = require("react");

function useAsyncFetch({
  useEffectDependency = [],
  condition,
  url,
  query,
  method = "GET",
  data: body,
  initialPending,
  initialError,
  initialData,
  initialResponseMethod = "json",
  onStart,
  onSuccess,
  onFail,
  onFinish,
  ...fetchConfig
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
      return initialResponse[initialResponseMethod]();
    },
    success: (responseJSON) => {
      setData(responseJSON);
      onSuccess && onSuccess(responseJSON);
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
      ...fetchConfig,
    };
    fetch(url + query, options)
      .then((r) => !unmounted && handle.initialResponse(r))
      .then((r) => !unmounted && handle.success(r))
      .catch((e) => !unmounted && handle.fail(e))
      .finally(() => !unmounted && handle.finish());
  }

  useEffect(() => {
    !url && console.warn("[async-fetch] url is required.");
    !unmounted && url && !pending && condition !== false && sendRequest();
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
