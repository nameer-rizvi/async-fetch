import { useState, useEffect } from "react";
import useInterval from "./useInterval";

let controller;

function useAsyncFetch(props, props2) {
  let {
    url,
    query,
    params,
    data: requestData,
    parser = "json",
    onStart,
    onSuccess,
    onFail,
    onFinish,
    deps = [],
    ignore,
    poll,
    ...props3
  } = props instanceof Object ? props : {};

  if (typeof props === "string") url = props;

  const [pending1, setPending1] = useState();

  const [pending2, setPending2] = useState();

  const [error, setError] = useState();

  const [data, setData] = useState();

  const [unmounted, setUnmounted] = useState();

  const cancelActiveRequest = () => controller?.abort?.();

  async function sendRequest() {
    try {
      cancelActiveRequest();

      controller = new AbortController();

      if (!unmounted) {
        if (pending1) {
          setPending2(true);
        } else setPending1(true);
        setError();
        if (onStart) onStart();
      }

      if (query || params)
        url += "?" + new URLSearchParams(query || params).toString();

      const response = await fetch(url, {
        signal: controller?.signal,
        body: requestData && JSON.stringify(requestData),
        ...props2,
        ...props3,
      });

      if (!response.ok)
        throw new Error(
          JSON.stringify({
            code: r.status,
            text: r.statusText,
            response: await response.text(),
          })
        );

      const parsedResponse = await response[parser]();

      if (!unmounted) {
        setData(parsedResponse);
        if (onSuccess) onSuccess(parsedResponse);
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
      if (!unmounted) {
        if (pending1) {
          setPending2(false);
        } else setPending1(false);
        if (onFinish) onFinish();
      }
    }
  }

  useEffect(() => {
    if (ignore !== true) sendRequest();
  }, deps); // eslint-disable-line

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
