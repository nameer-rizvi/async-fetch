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

| Key            | Type     | Definition                                                                                                     | Default |
|----------------|----------|----------------------------------------------------------------------------------------------------------------|---------|
| url            | String   | URL to send request to.                                                                                        |         |
| query          | Object   | Query parameters to include in the request (alt key name: "params").                                           |         |
| data           | Object   | Data object to include in the request body.                                                                    |         |
| responseParser | String   | Parser method to use on the response.                                                                          | "json"  |
| onStart        | Function | Callback function to run before the request is sent.                                                           |         |
| onSuccess      | Function | Callback function to run after the response has been parsed. The parsed response is available in the callback. |         |
| onFail         | Function | Callback function to run when the request responds with an error. The error is available in the callback.      |         |
| onFinish       | Function | Callback function to run when after the request has completed, regardless of success or failure.               |         |
| useEffect      | Array    | Dependency array for the useEffect.                                                                            | []      |
| ignoreEffect   | Boolean  | Condition where if true the request won't send unless called using the sendRequest OUT property.               |         |
| poll           | Number   | Time interval (in milliseconds) for polling.                                                                   |         |

It is assumed that any other property that's provided is to be used for the actual fetch.

### Available OUT Props And Definitions

| Key           | Type     | Definition                               |
| ------------- | -------- | ---------------------------------------- |
| pending       | Boolean  | Whether the request is active or not.    |
| error         | Any      | The response error.                      |
| data          | Any      | The response data.                       |
| sendRequest   | Function | Function to send the request manually.   |
| cancelRequest | Function | Function to cancel the request manually. |
