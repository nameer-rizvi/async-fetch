import { useState, useEffect } from "react";
import useInterval from "./useInterval";

let controller;

function useAsyncFetch(props, fetchProps = {}) {
  let {
    url,
    query,
    params,
    data: requestData,
    responseParser = "json",
    onStart,
    onSuccess,
    onFail,
    onFinish,
    ignoreEffect,
    useEffect: useEffectDependency = [],
    poll,
    ...fetchProps2
  } = props && props.constructor === Object ? props : {};

  if (props && props.constructor === String) url = props;

  const [pending1, setPending1] = useState();
  const [pending2, setPending2] = useState();
  const [error, setError] = useState();
  const [data, setData] = useState();
  const [unmounted, setUnmounted] = useState();

  function cancelActiveRequest() {
    if (controller && controller.abort) controller.abort();
  }

  async function sendRequest() {
    try {
      cancelActiveRequest();

      controller = new AbortController();

      const options = {
        signal: controller && controller.signal,
        ...fetchProps,
        ...fetchProps2,
      };

      if (query || params)
        url += "?" + new URLSearchParams(query || params).toString();

      if (requestData) options.body = JSON.stringify(requestData);

      if (!unmounted) {
        if (pending1) {
          setPending2(true);
        } else setPending1(true);
        setError();
        if (onStart) onStart();
      }

      const response = await fetch(url, options);

      if (!response.ok)
        throw new Error(response.statusText || response.status.toString());

      const parsedResponse = await response[responseParser]();

      if (!unmounted) {
        setData(parsedResponse);
        if (onSuccess) onSuccess(parsedResponse);
      }
    } catch (error) {
      if (!unmounted && error.name !== "AbortError") {
        setError(error);
        if (onFail) onFail(error);
      }
    } finally {
      if (!unmounted) {
        if (pending1) {
          setPending2(false);
        } else setPending1(false);
        if (onFinish) onFinish();
      }
    }
  }

  useEffect(() => {
    if (ignoreEffect !== true) sendRequest();
  }, useEffectDependency); // eslint-disable-line

  useInterval(() => {
    sendRequest();
  }, poll);

  useEffect(() => {
    return () => {
      setUnmounted(true);
      cancelActiveRequest();
    };
  }, []);

  return {
    pending: pending1 || pending2,
    error,
    data,
    sendRequest,
    cancelRequest: cancelActiveRequest,
  };
}

export default useAsyncFetch;
