# useAsyncFetch

Use fetch asynchronously for requests within React components.

## Installation

```
$ npm i async-fetch
```

## Usage

Provide your config and handle the response.

```javascript
import React from "react";
import useAsyncFetch from "async-fetch";

const { pending, data, error, sendRequest, cancelRequest } = useAsyncFetch(
  "https://jsonplaceholder.typicode.com/todos/1"
);

return pending ? (
  "Loading..."
) : data ? (
  "Data: " + JSON.stringify(data)
) : error ? (
  "Error: " + error.toString()
) : (
  <React.Fragment>
    <br />
    <br />
    <button onClick={sendRequest}>Send request.</button>
    <br />
    <br />
    <button onClick={cancelRequest}>Cancel request.</button>
  </React.Fragment>
);
```

### Available IN Props And Definitions

The minimum requirement for the hook is either a url string or an object with a url property.

| Key                   | Type     | Definition                                                                                                                                      | Default |
| --------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| initialPending        | Boolean  | Initial boolean of the pending state.                                                                                                           |         |
| initialError          | Any      | Initial value of the error state.                                                                                                               |         |
| initialData           | Any      | Initial value of the data state.                                                                                                                |         |
| useEffectDependency   | Array    | Dependency array for the useEffect.                                                                                                             | []      |
| disableController     | Boolean  | To allow fetch's AbortController API to cancel requests.                                                                                        |         |
| poll                  | Number   | Time interval (in milliseconds) for polling.                                                                                                    |         |
| manual                | Boolean  | Condition where if true the request won't send unless called using the sendRequest OUT property.                                                |         |
| condition             | Boolean  | Conditional statement where if false, the request won't send.                                                                                   |         |
| url                   | String   | URL to send request to.                                                                                                                         |         |
| method                | String   | Request method type.                                                                                                                            | "GET"   |
| query                 | Object   | Query parameters to include in the request.                                                                                                     |         |
| data                  | Object   | Data object to include in the request body.                                                                                                     |         |
| initialResponseParser | String   | Parser method to use on the initial response.                                                                                                   | "json"  |
| onStart               | Function | Callback function to run before the request is sent.                                                                                            |         |
| onSuccess             | Function | Callback function to run after the response has been handled using the initialResponseParser. The parsed response is available in the callback. |         |
| onFail                | Function | Callback function to run when the request responds with an error. The error is available in the callback.                                       |         |
| onFinish              | Function | Callback function to run when after the request is completed, regardless of success or failure                                                  |         |

It is assumed that any other property that's provided is to be used for the actual fetch.

### Available OUT Props And Definitions

| Key           | Type     | Definition                               |
| ------------- | -------- | ---------------------------------------- |
| pending       | Boolean  | Whether the request is active or not.    |
| error         | Any      | The response error.                      |
| data          | Any      | The response data.                       |
| setPending    | Boolean  | Custom setter for pending state.         |
| setError      | Any      | Custom setter for error state.           |
| setData       | Any      | Custom setter for data state.            |
| sendRequest   | Function | Function to send the request manually.   |
| cancelRequest | Function | Function to cancel the request manually. |
