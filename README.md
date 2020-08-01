# useFetch

Asynchronously use fetch for requests within React components.

## Installation

```
$ npm i fetcher-hook
```

### Usage

Provide your fetch config or api string and handle the response.

```javascript
import { Fragment } from "react";
import useFetch from "fetcher-hook";

const { pending, data, error, sendRequest, cancelRequest } = useFetch(
  "http://fake.com/api/resource"
);

return pending ? (
  <Fragment>
    <p>Loading...</p>
    <button onClick={cancelRequest}>Click here to cancel request.</button>
  </Fragment>
) : data ? (
  "Data: " + JSON.stringify(data)
) : error ? (
  <button onClick={sendRequest}>
    Error: {error.toString()}. Click here to try again.
  </button>
) : (
  <button onClick={sendRequest}>Click here to send request.</button>
);
```

### Available IN Props And Definitions

The hook only accepts one param, which can either be a string or an object. If it's a string, the param is assumed to be the url to fetch from and it's plugged-in directly to the fetch, otherwise, if it's an object, there's a few 'settings' props available to modify the request.

- _requestCondition_: a conditional statement that must be satisfied in order to run the request.
- _initialPendingState_: a boolean to define the initial pending state.
- _initialDataState_: a value to define the initial data state.
- _initialErrorState_: a value to define the initial error state.
- _defer_: a boolean to define whether or not the request should run on mount or be deferred until manually called.
- _persistData_: a boolean to define whether or not the data state should be persisted on each new request.
- _persistError_: a boolean to define whether or not the error state should be persisted on each new request.
- _onSuccess_: a function that'll run on a successful request, with the request data provided as a param.
- _onFail_: a function that'll run on a failed request, with the request error provided as a param.
- _onFinish_: a function that'll run once the request has completed (successfully or unsuccessfully).

It is assumed that any other prop(s) that's provided is to be used for the actual fetch function.

### Available OUT Props And Definitions

- _pending_: whether the request is active or not.
- _data_: the response data from the request.
- _error_: the response error from the request.
- _setPending_: custom setter for pending state.
- _setData_: custom setter for data state.
- _setError_: custom setter for error state.
- _sendRequest_: function to manually send request.
- _cancelRequest_: function to manually cancel request.
