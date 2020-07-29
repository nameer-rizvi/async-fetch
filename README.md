# useFetch

Asynchronously use fetch for requests within React components.

All credit to [useHooks.com](https://usehooks.com/useAsync/).

## Installation

```
$ npm i fetcher-hook
```

### Usage

Provide your fetch config or api string and handle the response.

```javascript
import useFetch from "fetcher-hook";

const App = () => {
	const { pending, data, error, request } = useFetch(
		"http://fake.api.resource/"
	);
	return pending ? (
		"Loading..."
	) : data ? (
		"Data: " + JSON.stringify(data)
	) : error ? (
		<button onClick={request}>Error: {error}. Click here to try again.</button>
	) : null;
};
```

### Available Props And Definitions

- _pending_: whether the request is active or not.
- _data_: the response data from the request.
- _error_: the response error from the request.
- _setPending_: custom setter for pending prop.
- _setData_: custom setter for data prop.
- _setError_: custom setter for error prop.
- _request_: function to send requests.

Along with the fetch config, the hook has a second param available to define whether or not it should run immediately.

Ex.

```javascript
const { request: sendRequest } = useFetch({ ...fetchConfig }, false);

return <button onClick={sendRequest}>Click here to fetch data.</button>;
```
