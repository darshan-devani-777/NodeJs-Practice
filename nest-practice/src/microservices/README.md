# Microservices Demo

This folder hosts lightweight NestJS microservice samples. The included demo exposes two message patterns over TCP (`demo_sum` and `demo_ping`) so you can get started quickly.

## Running the demo service

```bash
npm run microservice:demo
```

The service listens on `tcp://127.0.0.1:4001` by default. Override with `DEMO_MICROSERVICE_HOST` or `DEMO_MICROSERVICE_PORT`.

## Testing the patterns

### From another Nest app / module

```ts
client.send({ cmd: 'demo_sum' }, [1, 2, 3]).subscribe(console.log);
client.send({ cmd: 'demo_ping' }, 'hello').subscribe(console.log);
```

### Via existing HTTP server in this repo

The root HTTP application already ships with `DemoClientModule`, which exposes (remember the global `/api` prefix from `main.ts`):

- `POST /api/microservices-demo/sum` with body `{ "values": [1, 2, 3] }`
- `GET /api/microservices-demo/ping?payload=hello` (query param optional; defaults to `"ping"`)

Both endpoints proxy the request to the TCP microservice and return its response, so you can validate everything with simple HTTP requests (curl/Postman) once `npm run start:dev` and `npm run microservice:demo` are running.

#### Example `demo_sum` call

```bash
curl -X POST http://localhost:3000/api/microservices-demo/sum \
  -H "Content-Type: application/json" \
  -d '{"values":[1,2,3]}'
```

Sample response:

```json
{
  "pattern": "demo_sum",
  "payload": [1, 2, 3],
  "result": 6,
  "notes": "Shows how arrays are forwarded to the TCP microservice and transformed by DemoService."
}
```

You can change the numbers to validate different scenarios (empty arrays default to `0`, non-number inputs are coerced to `0`). This makes it easy to wire automated smoke tests or Postman collections without writing extra code.

Feel free to add more folders/files under `src/microservices/` for additional microservice examples.

