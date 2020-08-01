const { useState, useEffect } = require("react");

module.exports = (props) => {
  const {
    url: _url,
    requestCondition,
    initialPendingState,
    initialDataState,
    initialErrorState,
    defer,
    persistData,
    persistError,
    onStart,
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

  const responseHandler = (signal, handler) =>
    signal && !signal.aborted && pending && handler();

  function request(url) {
    const controller = new AbortController();
    const signal = controller.signal;
    onStart && onStart();
    setPending(true);
    !persistData && setData(null);
    !persistError && setError(null);
    fetch(url, { signal, ...config })
      .then((results) => results.json())
      .then((data) =>
        responseHandler(signal, () => {
          setData(data);
          onSuccess && onSuccess(data);
        })
      )
      .catch((err) =>
        responseHandler(signal, () => {
          setError(err);
          onFail && onFail(err);
        })
      )
      .finally(() =>
        responseHandler(signal, () => {
          setPending();
          onFinish && onFinish();
        })
      );
    return { cancel: () => controller.abort() };
  }

  useEffect(() => {
    const url = _url || (typeof props === "string" && props);
    const currentRequest =
      sendRequest && url && requestCondition !== false && request(url);
    !currentRequest && setPending();
    return () => {
      currentRequest && currentRequest.cancel();
      setPending();
    };
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
