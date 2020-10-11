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

- _initialPending_: initial boolean of the pending state.
- _initialError_: initial value of the error state.
- _initialData_: initial value of the data state.
- _useEffectDependency_: dependency array for the useEffect (default: []).
- _manual_: boolean, where if true the request won't run unless called using the sendRequest OUT prop.
- _condition_: conditional statement where if false, the request wont' send.
- _url_: url string to fetch from.
- _method_: request method string (default: "GET").
- _query_: query parameters (object) to include in the request.
- _data_: data object to include in the request body.
- _onStart_: callback function to run before the request is sent.
- _onSuccess_: callback function to run after the response has been handled using the _initialResponseParser_. The response is available in the callback.
- _onFail_: callback function to run when there is an error with the fetch. The error is available in the callback.
- _onFinish_: callback function to run when after the request is completed, regardless of success or failure.
- _initialResponseParser_: parser to use on the response (default: json).

It is assumed that any other property that's provided is to be used for the actual fetch.

### Available OUT Props And Definitions

- _pending_: whether the request is active or not.
- _error_: the response error.
- _data_: the response data.
- _setPending_: custom setter for pending state.
- _setError_: custom setter for error state.
- _setData_: custom setter for data state.
- _sendRequest_: function to send the request manually.
- _cancelRequest_: function to cancel the request manually.
