# useAsyncFetch

Asynchronously use fetch for requests within React components.

## Installation

```
$ npm i async-fetch
```

### Usage

Provide your config and handle the response.

```javascript
import { Fragment } from "react";
import useAsyncFetch from "async-fetch";

const { pending, data, error, sendRequest, cancelRequest } = useAsyncFetch({
  url: "http://domain.com/api/resource",
});

return pending ? (
  <Fragment>
    <p>Loading...</p>
    <button onClick={cancelRequest}>Click here to cancel the request.</button>
  </Fragment>
) : data ? (
  "Data: " + JSON.stringify(data)
) : error ? (
  <button onClick={sendRequest}>
    Error: {error.toString()}. Click here to try again.
  </button>
) : (
  <button onClick={sendRequest}>Click here to send the request again.</button>
);
```

### Available IN Props And Definitions

The minimum requirement for the hook is an object with a url property `({url: ""})`.

- _useEffectDependency_: the dependency array for the useEffect (default: []).
- _condition_: a conditional statement where if false, the request wont' send.
- _url_: the url string to fetch from.
- _query_: query parameters (object) to include in the request.
- _method_: the request method string (default: "GET").
- _data_: data object to include in the request body.
- _initialPending_: the initial boolean of the pending state.
- _initialError_: the initial value of the error state.
- _initialData_: the initial value of the data state.
- _initialResponseMethod_: which method to use to return the response (default: json).
- _onStart_: callback function to run before the request is sent.
- _onSuccess_: callback function to run when the response has been handled using the _intialResponseMethod_. The response is available in the callback.
- _onFail_: callback function to run when there was an error with the fetch. The error is available in the callback.
- _onFinish_ callback function to run when the request has completed, regardless of success or failure.

It is assumed that any other property that's provided is to be used for the actual fetch.

### Available OUT Props And Definitions

- _pending_: whether the request is active or not.
- _data_: the response data.
- _error_: the response error.
- _setPending_: custom setter for pending state.
- _setData_: custom setter for data state.
- _setError_: custom setter for error state.
- _sendRequest_: function to manually send request.
- _cancelRequest_: function to manually cancel request.
