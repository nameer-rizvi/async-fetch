// https://github.com/Hermanya/use-interval/blob/master/src/index.tsx

const { useEffect, useRef } = require("react");

const noop = () => {};

function useInterval(callback, poll) {
  const savedCallback = useRef(noop);

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    if (poll === null || poll === false) return undefined;
    const tick = () => savedCallback.current();
    const id = setInterval(tick, poll);
    return () => clearInterval(id);
  }, [poll]);
}

module.exports = useInterval;
