# useAsyncFetch

Use fetch for requests within React components.

## Installation

```
$ npm i async-fetch
```

## Usage

Provide a url and handle the request.

```javascript
import React from "react";
import useAsyncFetch from "async-fetch";

function App() {
  const { pending, data, error, sendRequest, cancelRequest } = useAsyncFetch(
    "https://jsonplaceholder.typicode.com/todos/1",
  );

  return (
    <React.Fragment>
      <button onClick={sendRequest}>Send request.</button>
      <br />
      <br />
      <button onClick={cancelRequest} disabled={!pending}>
        Cancel request.
      </button>
      <br />
      <br />
      {pending
        ? "Loading..."
        : data
        ? JSON.stringify(data)
        : error
        ? JSON.stringify(error)
        : ""}
    </React.Fragment>
  );
}

export default App;
```

### Available IN Props And Definitions

The minimum requirement for the hook is a url string as the first argument. The second argument has the following available options, while anything else that is provided is passed to the fetch request:

| Key            | Type     | Definition                                                                                                      | Default |
| -------------- | -------- | --------------------------------------------------------------------------------------------------------------- | ------- |
| initialPending | Boolean  | Initial state for the pending constant.                                                                         |         |
| initialData    | Any      | Initial state for the data constant.                                                                            |         |
| initialError   | Any      | Initial state for the error constant.                                                                           |         |
| deps           | Array    | List of dependencies to run the request on.                                                                     |         |
| poll           | Number   | Number of milliseconds to wait for polling requests.                                                            |         |
| cachetime      | Number   | Number of milliseconds to cache responses for.                                                                  | 60000   |
| timeout        | Number   | Number of milliseconds to wait before canceling the request.                                                    | 30000   |
| ignoreCleanup  | Boolean  | Whether or not the hook should cleanup on component unmount.                                                    |         |
| ignoreRequest  | Boolean  | Whether or not the request should send.                                                                         |         |
| query          | Object   | JSON object to append to the url as query params.                                                               |         |
| params         | Object   | JSON object to append to the url as query params.                                                               |         |
| data           | Object   | JSON object to send in the request body.                                                                        |         |
| parser         | String   | Method used to parse the response.                                                                              | "json"  |
| onStart        | Function | Callback function to call when the request starts.                                                              |         |
| onSuccess      | Function | Callback function to call when the response has been received. The response is available as the first argument. |         |
| onFail         | Function | Callback function to call when the request has failed. The error is available as the first argument.            |         |
| onFinish       | Function | Callback function to call when the request has finished.                                                        |         |

### Available OUT Props And Definitions

| Key           | Type     | Definition                               |
| ------------- | -------- | ---------------------------------------- |
| pending       | Boolean  | Whether or not the request is active.    |
| error         | Any      | The response error.                      |
| data          | Any      | The response data.                       |
| sendRequest   | Function | Function to send the request manually.   |
| cancelRequest | Function | Function to cancel the request manually. |
