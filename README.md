# reactfetch

Asynchronously use fetch for requests within React components.

All credit to [useHooks.com](https://usehooks.com/useAsync/).

## Installation

```
$ npm i reactfetch
```

### Usage

Provide your fetch config or api string and handle the response params.

```javascript
import reactfetch from "reactfetch";

const App = () => {
	const { pending, data, error } = reactfetch("http://fake.api.resource/");
	return pending
		? "Loading..."
		: data
		? "Data: " + JSON.stringify(data)
		: error
		? "Error: " + JSON.stringify(error)
		: null;
};
```
