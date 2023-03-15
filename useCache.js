import useInterval from "./useInterval.js";

const cache = {};

function useCache(cachetime) {
  useInterval(() => {
    for (let [key, value] of Object.entries(cache))
      if (value.timestamp + cachetime < new Date().getTime()) delete cache[key];
  }, cachetime);

  function makeKey(url, fetchProps) {
    return typeof fetchProps.body === "string" ? url + fetchProps.body : url;
  }

  function get(url, fetchProps) {
    if (cachetime) {
      const key = makeKey(url, fetchProps);
      return cache[key]?.response;
    }
  }

  function set(url, fetchProps, response) {
    if (cachetime) {
      const key = makeKey(url, fetchProps);
      const payload = { timestamp: new Date().getTime(), response };
      cache[key] = payload;
    }
  }

  return { get, set };
}

export default useCache;
