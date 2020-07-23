# useFetch

Asynchronously use fetch for requests within React components.

All credit to [useHooks.com](https://usehooks.com/useAsync/).

## Installation

```
$ npm i usefetch
```

### Usage

Provide your fetch config or api string and handle the response params.

```javascript
import useFetch from "usefetch";

const App = () => {
	const { pending, data, error } = useFetch("http://fake.api.resource/");
	return pending
		? "Loading..."
		: data
		? "Data: " + JSON.stringify(data)
		: error
		? "Error: " + JSON.stringify(error)
		: null;
};
```
