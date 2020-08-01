const { useState, useEffect } = require("react");

module.exports = (props) => {
  const {
    requestCondition,
    initialPendingState,
    initialDataState,
    initialErrorState,
    defer,
    persistData,
    persistError,
    delay,
    onSuccess,
    onFail,
    onFinish,
    // Assumption that rest of the props are fetch config options:
    ...config
  } = (props && props.constructor === Object && props) || {};

  const [pending, setPending] = useState(initialPendingState || !defer);
  const [data, setData] = useState(initialDataState);
  const [error, setError] = useState(initialErrorState);
  const [sendRequest, setSendRequest] = useState(!defer);

  const delayedResponse = (signal, fn) =>
    !signal.aborted && pending && (delay ? setTimeout(fn, delay) : fn());

  function request(url) {
    const controller = new AbortController();
    const signal = controller.signal;
    setPending(true);
    !persistData && setData(null);
    !persistError && setError(null);
    fetch(url, { signal, ...config })
      .then((results) => results.json())
      .then((data) =>
        delayedResponse(signal, () => {
          setData(data);
          onSuccess && onSuccess(data);
        })
      )
      .catch((err) =>
        delayedResponse(signal, () => {
          setError(err);
          onFail && onFail(err);
        })
      )
      .finally(() =>
        delayedResponse(signal, () => {
          setPending();
          onFinish && onFinish();
        })
      );
    return { cancel: () => controller.abort() };
  }

  useEffect(() => {
    const url = typeof props === "string" ? props : props && props.url;
    const newRequest =
      requestCondition !== false && sendRequest && url && request(url);
    const endRequest = () => {
      newRequest && newRequest.cancel();
      setPending();
    };
    !sendRequest && endRequest();
    return endRequest;
  }, [sendRequest]);

  return {
    pending,
    data,
    error,
    setPending,
    setData,
    setError,
    sendRequest: () => setSendRequest(true),
    cancelRequest: () => setSendRequest(false),
  };
};
