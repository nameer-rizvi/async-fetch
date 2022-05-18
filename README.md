# useAsyncFetch

Use fetch asynchronously for requests within React components.

## Installation

```
$ npm i async-fetch
```

## Usage

Provide your request config and handle the response.

```javascript
import React from "react";
import useAsyncFetch from "async-fetch";

const App = () => {
  const { pending, data, error, sendRequest, cancelRequest } = useAsyncFetch(
    "http://localhost:5000/api/v1/"
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
        ? "Error: " + error.toString()
        : ""}
    </React.Fragment>
  );
};

export default App;
```

### Available IN Props And Definitions

The minimum requirement for the hook is either a url string or an object with a url property. It is assumed that any other property that's provided is to be used for the actual fetch.

| Key       | Type     | Definition                                                                                                     | Default |
| --------- | -------- | -------------------------------------------------------------------------------------------------------------- | ------- |
| url       | String   | URL to send request to.                                                                                        |         |
| query     | Object   | Query parameters to include in the request (alt key name: "params").                                           |         |
| data      | Object   | Data object to include in the request body.                                                                    |         |
| parser    | String   | Method used to parse the response.                                                                             | "json"  |
| onStart   | Function | Callback function to run before the request is sent.                                                           |         |
| onSuccess | Function | Callback function to run after the response has been parsed. The parsed response is available in the callback. |         |
| onFail    | Function | Callback function to run when the request responds with an error. The error is available in the callback.      |         |
| onFinish  | Function | Callback function to run after the request has completed, regardless of success or failure.                    |         |
| deps      | Array    | Dependency array for the useEffect.                                                                            | []      |
| ignore    | Boolean  | Condition where if true the request won't send unless called using the sendRequest OUT property.               |         |
| poll      | Number   | Time interval (in milliseconds) for polling.                                                                   |         |

### Available OUT Props And Definitions

| Key           | Type     | Definition                               |
| ------------- | -------- | ---------------------------------------- |
| pending       | Boolean  | Whether the request is active or not.    |
| error         | Any      | The response error.                      |
| data          | Any      | The response data.                       |
| sendRequest   | Function | Function to send the request manually.   |
| cancelRequest | Function | Function to cancel the request manually. |
