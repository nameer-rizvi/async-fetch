const { useState, useCallback, useEffect } = require("react");

//   Cancelling fetch requests...
//   https://stackoverflow.com/questions/41996814/how-to-abort-a-fetch-request
//   https://stackoverflow.com/questions/31061838/how-do-i-cancel-an-http-fetch-request
//   https://davidwalsh.name/cancel-fetch

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

  return { pending, setPending, data, setData, error, setError, request };
};
