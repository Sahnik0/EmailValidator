# Email Validator

This project is a small Express API that validates an email address and
identifies whether its local name is a known role address, such as `admin`,
`support`, or `sales`.

## Project structure

```text
index.js
middleware/
  validateEmail.js
routes/
  validator.js
```

## Responsibilities of each part

### `index.js`

This is the application entry point. It:

- Creates the Express application.
- Parses JSON and URL-encoded request bodies.
- Registers the routes.
- Starts the server.

```js
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/api/validate', validator);
```

### Middleware

Middleware runs between the incoming request and the final route handler.
It receives three arguments:

```js
function middleware(req, res, next) {
    // check or prepare the request
    next();
}
```

For this project, `validateEmail` is responsible for:

- Reading the email from `req.body.email`.
- Checking its type and whether it is empty.
- Checking its length and format.
- Extracting the name and domain.
- Calculating whether the name is a role address.
- Passing the processed data to the route.

Middleware should handle common checks and request preparation. If the
application later has more complex email-validation rules, the actual
business logic can be moved to a service such as:

```text
services/
  emailValidator.js
```

### Routes

Routes define the HTTP method and URL and send the response. The route
should not repeat validation that the middleware has already completed.

```js
router.post('/', validateEmail, (req, res) => {
    const {name, domain, role} = req.emailData;

    res.status(200).json({
        message: 'Valid mail',
        valid: true,
        name,
        domain,
        role
    });
});
```

For this project:

```text
Middleware  -> validate and prepare the email
Route       -> return the HTTP response
Service     -> future place for larger reusable business logic
```

## Request flow

Send a request to:

```text
POST http://localhost:5000/api/validate
```

with this JSON body:

```json
{
  "email": "admin@example.com"
}
```

The request passes through these steps:

```text
Client
  |
  v
index.js
  |
  | express.json() parses the JSON body
  | req.body.email = "admin@example.com"
  v
/api/validate router
  |
  v
validateEmail middleware
  |
  | invalid -> sends 400 response and stops
  | valid   -> stores processed data and calls next()
  v
POST route handler
  |
  v
200 JSON response
```

`app.use('/api/validate', validator)` and `router.post('/')` combine to
create the complete endpoint:

```text
POST /api/validate
```

## `req.body` versus `req.emailData`

`req.body` contains the data sent by the client. For the example request:

```js
req.body
// { email: 'admin@example.com' }
```

The client only sends `email`; it does not send the calculated `name`,
`domain`, or `role`.

The middleware calculates those values and attaches them to the current
request object:

```js
req.emailData = {
    value,
    name,
    domain,
    role: ROLE_ADDRESSES.has(name)
};
```

For `admin@example.com`, this becomes:

```js
req.emailData = {
    value: 'admin@example.com',
    name: 'admin',
    domain: 'example.com',
    role: true
};
```

`req.emailData` is not built into Express. It is a custom property created
by this application so that the next handler can use the middleware's
results.

The route reads it like this:

```js
const {name, domain, role} = req.emailData;
```

The `req` object is the same request object throughout the middleware and
route chain. Calling `next()` passes that request to the next handler.

## Why not use a global variable?

Do not write this:

```js
emailData = {
    name,
    domain,
    role
};
```

That creates or uses a global variable in non-strict JavaScript. It may
appear to work, but another request can overwrite it while the first
request is being processed. It is also not the standard Express pattern.

Use a request property instead:

```js
req.emailData = {
    name,
    domain,
    role
};
```

This keeps each request's data isolated.

## Middleware stopping or continuing a request

For an invalid email, the middleware returns a response:

```js
return res.status(400).json({
    message: 'Not a valid mail',
    valid: false
});
```

Because it does not call `next()`, the route handler does not run. Therefore,
the route's `200` response is never sent for an invalid email.

For a valid email, the middleware calls:

```js
next();
```

Then the route handler runs and sends the `200` response.

```text
Invalid request -> middleware -> 400 response -> stop
Valid request   -> middleware -> next() -> route -> 200 response
```

## Role-address check

The role addresses are stored in a `Set`:

```js
const ROLE_ADDRESSES = new Set([
    'admin',
    'info',
    'support',
    'sales',
    'noreply'
]);
```

The name is checked with:

```js
ROLE_ADDRESSES.has(name)
```

This checks the value of the variable `name`. It must not be written as
`ROLE_ADDRESSES.has('name')`, because that checks the literal word
`"name"` instead.

For example:

```js
ROLE_ADDRESSES.has('admin'); // true
ROLE_ADDRESSES.has('john');  // false
```

The check is based on the part before `@`:

```text
admin@example.com
----- name
        ----------- domain
```

## Example responses

### Valid role address

Request:

```json
{
  "email": "admin@example.com"
}
```

Response:

```json
{
  "message": "Valid mail",
  "valid": true,
  "name": "admin",
  "domain": "example.com",
  "role": true
}
```

### Valid non-role address

```json
{
  "message": "Valid mail",
  "valid": true,
  "name": "john",
  "domain": "example.com",
  "role": false
}
```

### Invalid address

Invalid input is rejected by the middleware with a `400` response. The
route handler is not reached.

## How to run

Install dependencies:

```bash
npm install
```

Start the server:

```bash
node index.js
```

The server listens on port `5000`.
