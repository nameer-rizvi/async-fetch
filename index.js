const { useState, useCallback, useEffect } = require("react");

module.exports = (config, immediate = true) => {
  const [pending, setPending] = useState();
  const [data, setData] = useState();
  const [error, setError] = useState();

  const request = useCallback(() => {
    setPending(true);
    setData(null);
    setError(null);
    return fetch(config)
      .then((res) => res.json())
      .then(setData)
      .catch(setError)
      .finally(setPending);
  }, [fetch]);

  useEffect(() => {
    immediate && request();
  }, [request, immediate]);

  return { pending, data, error };
};
