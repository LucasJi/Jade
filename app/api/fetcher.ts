const fetcher = (url: RequestInfo | URL) => fetch(url).then(res => res.json());

export default fetcher;
