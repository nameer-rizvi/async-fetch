# async-fetch

A React hook for async fetch requests with built-in state management, cancellation, and polling.

## Installation

```bash
npm install async-fetch
# or
yarn add async-fetch
```

## Usage

```javascript
import useAsyncFetch from "async-fetch";

function App() {
  const { pending, data, error, sendRequest, cancelRequest } = useAsyncFetch(
    "https://jsonplaceholder.typicode.com/todos/1",
  );

  return (
    <React.Fragment>
      <button onClick={sendRequest}>Send request</button>
      <button onClick={cancelRequest} disabled={!pending}>
        Cancel request
      </button>
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
```

### Auto-fetch on mount

By default the hook fires on mount. Set `auto: false` to disable:

```javascript
const { pending, data, sendRequest } = useAsyncFetch(url, { auto: false });
```

### POST with JSON body

```javascript
const { pending, data, error } = useAsyncFetch("/api/submit", {
  method: "POST",
  data: { name: "foo" },
});
```

### Polling

```javascript
const { data } = useAsyncFetch("/api/status", { poll: 5000 });
```

### Callbacks

```javascript
useAsyncFetch("/api/user/1", {
  onStart: () => console.log("started"),
  onSuccess: (data) => console.log(data),
  onFail: (error) => console.error(error),
  onFinish: () => console.log("finished"),
});
```

### Cancel on demand

```javascript
const { cancelRequest } = useAsyncFetch("/api/user/1");
<button onClick={cancelRequest}>Cancel</button>;
```

## Request options

The minimum requirement is a URL string as the first argument. The second argument accepts the following options — anything else is passed directly to the underlying `fetch` call.

| Option           | Type                                                        | Default  | Description                                          |
| ---------------- | ----------------------------------------------------------- | -------- | ---------------------------------------------------- |
| `initialPending` | `boolean`                                                   | `false`  | Initial state for `pending`                          |
| `initialError`   | `E`                                                         |          | Initial state for `error`                            |
| `initialData`    | `T`                                                         |          | Initial state for `data`                             |
| `auto`           | `boolean`                                                   | `true`   | Whether to auto-send the request on mount            |
| `poll`           | `number`                                                    |          | Milliseconds between polling requests                |
| `timeout`        | `number`                                                    | `30000`  | Milliseconds before the request is cancelled         |
| `ignoreRequest`  | `boolean`                                                   |          | Skips sending the request when `true`                |
| `ignoreCleanup`  | `boolean`                                                   |          | Skips cancelling the request on unmount when `true`  |
| `query`          | `object`                                                    |          | Key-value pairs appended to the URL as search params |
| `params`         | `object`                                                    |          | Key-value pairs appended to the URL as search params |
| `data`           | `unknown`                                                   |          | Value to send as the request body                    |
| `parser`         | `"json" \| "text" \| "blob" \| "formData" \| "arrayBuffer"` | `"json"` | Method used to parse the response                    |
| `onStart`        | `() => void`                                                |          | Called when the request starts                       |
| `onSuccess`      | `(data: T) => void`                                         |          | Called with the response data on success             |
| `onFail`         | `(error: E) => void`                                        |          | Called with the error on failure                     |
| `onFinish`       | `() => void`                                                |          | Called when the request finishes                     |

## Response

| Property        | Type                  | Description                   |
| --------------- | --------------------- | ----------------------------- |
| `pending`       | `boolean`             | Whether the request is active |
| `error`         | `E`                   | The response error            |
| `data`          | `T`                   | The response data             |
| `sendRequest`   | `() => Promise<void>` | Sends the request manually    |
| `cancelRequest` | `() => void`          | Cancels the active request    |

## License

MIT
