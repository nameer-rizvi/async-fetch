import useInterval from "./useInterval.js";

const cache = {};

function useCache(cachetime) {
  useInterval(() => {
    for (let [key, value] of Object.entries(cache)) {
      if (value.timestamp + cachetime < new Date().getTime()) delete cache[key];
    }
  }, cachetime);

  function get(url) {
    if (cachetime) return cache[url]?.response;
  }

  function set(url, response) {
    if (cachetime) cache[url] = { timestamp: new Date().getTime(), response };
  }

  return { get, set };
}

export default useCache;
