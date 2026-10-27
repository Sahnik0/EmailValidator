# Email Validator Architecture

This document explains how the application is organized and how a request
moves through the system.

## Architecture overview

```text
Client
  |
  v
Express application (index.js)
  |
  v
Global middleware
  |-- JSON/body parsing
  |-- Redis rate limiting
  |
  v
Router
  |
  v
Email validation middleware
  |-- Type and empty-value checks
  |-- Format and length checks
  |-- Name/domain extraction
  |-- Role-address detection
  |-- MX-record lookup
  |
  v
Cache middleware
  |-- Read cached result from Redis
  |-- Store newly calculated result in Redis
  |
  v
Route handler
  |-- Persist result in MongoDB
  |-- Return the HTTP response
```

## Project structure

```text
index.js                 Application setup and server startup
middleware/
  validateEmail.js       Request validation and email-data preparation
routes/
  validator.js           HTTP endpoints and response handling
services/
  resolver.js            DNS/MX lookup service
lib/
  cacheData.js           Redis result caching
  rateLimiter.js         Redis request limiting
models/
  schema.js              MongoDB/Mongoose user schema
```

## Responsibilities

### Application entry point

`index.js` creates the Express application, loads environment variables,
registers body parsers and global middleware, mounts the router, and starts
the server.

Application-wide middleware must be registered before the routes it should
affect:

```js
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(rateLimiter);
app.use(validator);
```

### Rate limiter

`lib/rateLimiter.js` is Express middleware that uses the request IP as a
Redis key. It increments the request count and rejects requests that exceed
the configured limit.

```text
Allowed request -> next()
Too many requests -> 429 response
Redis unavailable -> 503 response
```

The rate limiter must run before the route. Otherwise the route may send its
response before the limiter gets a chance to execute.

### Email validation middleware

`middleware/validateEmail.js` reads the original client input from:

```js
req.body.email
```

It rejects invalid input and stops the request by returning a response. For
valid input, it calculates the normalized email data and attaches it to the
current request:

```js
req.emailData = {
    email,
    value,
    name,
    domain,
    role,
    mx
};
```

`req.emailData` is an application-defined property; it is not built into
Express. It allows the next middleware and route handler to use the results
without recalculating them or trusting values supplied by the client.

After successful validation, the middleware calls:

```js
next();
```

If it sends a `400` or `503` response, it must not call `next()`.

### MX resolver service

`services/resolver.js` performs the DNS/MX lookup. It is kept separate from
the middleware because it performs a reusable infrastructure operation.
The middleware calls the service and decides how its result affects the HTTP
request.

```text
resolver service -> checks DNS
validation middleware -> interprets the result
route -> returns the response
```

### Cache middleware

`lib/cacheData.js` uses Redis to cache processed email data. It should run
after `validateEmail`, because it needs `req.emailData`.

```text
validateEmail -> creates req.emailData
cacheData     -> reads or writes Redis using that data
route         -> uses req.emailData
```

When a cached value is found, the middleware can restore it to
`req.emailData` and call `next()`. It should not send a response unless
cache lookup is intentionally being used as the final result.

### Routes

`routes/validator.js` defines the HTTP method and URL and coordinates the
middleware chain. The route handler should mainly perform endpoint-specific
work, such as saving a validated result and returning JSON.

Example order:

```js
router.post(
    '/api/validate',
    validateEmail,
    cacheData,
    async (req, res) => {
        // use req.emailData
        // persist data if required
        // send one response
    }
);
```

### MongoDB model

`models/schema.js` defines the shape of stored validation data. Mongoose
enforces schema rules and MongoDB enforces indexes. If an old unique index
such as `roll_1` remains in the database after a schema change, it must be
removed explicitly; changing the JavaScript schema does not automatically
remove an existing MongoDB index.

## Request data flow

For a request such as:

```http
POST /api/validate
Content-Type: application/json
```

```json
{
  "email": "admin@example.com"
}
```

the flow is:

1. `express.json()` parses the body and creates `req.body.email`.
2. The rate limiter checks the request IP.
3. The router selects the validation endpoint.
4. `validateEmail` validates the email and checks its MX records.
5. `validateEmail` creates `req.emailData`.
6. `cacheData` reads or writes the Redis cache.
7. The route reads `req.emailData`.
8. The route optionally saves the result to MongoDB.
9. The route sends one HTTP response.

The original body and processed data have different purposes:

```js
req.body.email       // client-provided input
req.emailData        // server-validated and calculated data
```

Never use a global variable for request data. A global value can be
overwritten by another concurrent request. Request-specific data belongs on
`req`.

## Response rules

An Express request must receive exactly one response. Always stop execution
after sending a response:

```js
return res.status(400).json({error: 'Invalid email'});
```

A common source of `ERR_HTTP_HEADERS_SENT` is sending a response in an
`if` block and then continuing to send another response afterward. Use
`return` or an `else` branch.

For asynchronous database operations, await the operation before responding:

```js
const user = await User.findOne({email});
return res.status(200).json(user);
```

## Infrastructure dependencies

- **Express** handles HTTP requests and middleware.
- **Redis** supports rate limiting and caching.
- **DNS** provides MX-record checks.
- **MongoDB/Mongoose** stores validated results.
- **dotenv** loads local environment configuration.

Keep secrets and connection strings in `.env`, and do not commit that file:

```env
MONGO_URL=mongodb://127.0.0.1:27017/emailvalidator
```

Redis must be running on its configured host and port, normally
`127.0.0.1:6379`. If Redis is unavailable, `ioredis` reports
`ECONNREFUSED`.

## Design principles

```text
index.js     -> configure the application
middleware   -> validate and prepare requests
services     -> perform reusable business operations
lib          -> infrastructure helpers such as Redis
routes       -> coordinate endpoints and send responses
models       -> define persisted data
```

This separation keeps the API easier to test, reuse, scale, and integrate
with authentication systems without coupling the validator to one specific
consumer.
