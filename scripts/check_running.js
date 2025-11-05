const http = require('http');
const { performance } = require('perf_hooks');

const port = process.env.PORT || 5002;
const host = '127.0.0.1';
const url = `http://${host}:${port}/`;
const start = performance.now();

const req = http.get(url, (res) => {
	const time = Math.round(performance.now() - start);
	console.log(`UP ${url} -> ${res.statusCode} ${res.statusMessage} (${time}ms)`);
	res.resume();
});

req.on('error', (err) => {
	console.error(`DOWN ${url} -> ${err.code || err.message}`);
	process.exitCode = 1;
});

req.setTimeout(5000, () => {
	console.error(`DOWN ${url} -> timeout`);
	req.abort();
});