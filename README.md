# Finance Tracker

A full-stack app for tracking personal income and expenses. Every user has their own private list of transactions and can see how their money splits between income and expenses in charts.

Built to practice a complete JavaScript stack: a REST API with authentication and validation on the server, and a routed React client on the front.

## Features

- Register and log in with a username and password
- Add, list and delete transactions (income or expense, amount, category, date)
- Statistics with totals, an income versus expense chart and expenses per category
- Every transaction belongs to its owner, and users can never read or change each other's data
- Protected pages on the client and a clear message when the server cannot be reached

## Tech stack

**Server** (`server/`)
- Node.js 22+, Express 5, Mongoose 9 and MongoDB
- JWT authentication, bcrypt password hashing
- Validation with zod, helmet, CORS limited to the client origin and rate limiting on login and registration
- Vitest and supertest tests running against an in-memory MongoDB

**Client** (`client/`)
- React 19, React Router 7, Recharts, Vite

## Getting started

Requires Node.js 22 or newer.

```bash
git clone https://github.com/TellSamuelSomething/personal-finance-tracker.git
cd personal-finance-tracker
npm run install:all
```

### Try it without a database

This starts the API against a throwaway in-memory MongoDB (the first run downloads a MongoDB binary) and the client together. All data is gone when you stop it.

```bash
npm run start:memory
```

Open http://localhost:5173.

### Run with your own MongoDB

1. Have a MongoDB running, locally or on MongoDB Atlas.
2. Copy `server/.env.example` to `server/.env` and fill in `MONGO_URI` and `JWT_SECRET`.
3. Start the API and the client together:

```bash
npm start
```

The client runs on http://localhost:5173 and forwards `/api` requests to the API on port 5000.

### Environment variables

| Variable | Where | Description |
|----------|-------|-------------|
| `MONGO_URI` | server, required | MongoDB connection string |
| `JWT_SECRET` | server, required | Signing secret for login tokens, at least 32 characters |
| `PORT` | server | API port, default `5000` |
| `CLIENT_ORIGIN` | server | Origin allowed by CORS, default `http://localhost:5173` |
| `VITE_API_URL` | client | API base URL when it is not served from the same origin |

The server refuses to start when a required variable is missing.

### Other commands

| Command | Description |
|---------|-------------|
| `npm test` | Run the server tests |
| `npm run lint` | Lint the client |
| `npm run build` | Build the client for production |

## API

All routes are under `/api`. Transaction routes need the header `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create an account (username 3 to 30 characters, password 8 to 72) |
| POST | `/auth/login` | Log in, returns a token that is valid for one day |
| GET | `/transactions` | List your transactions, newest first |
| POST | `/transactions` | Add a transaction: `type` (`Income` or `Expense`), `amount` above 0, `category`, `date` |
| DELETE | `/transactions/:id` | Delete one of your transactions |
| GET | `/health` | Health check |

Errors are JSON. Invalid input gives `400` with a message per field, a missing or invalid token gives `401`, a taken username gives `409`, and another user's transaction gives `404`.

## Security notes

- Passwords are stored as bcrypt hashes and login answers the same way for a wrong password and an unknown username
- Tokens are signed with `HS256` and checked with that algorithm only
- Requests are limited to 10 KB and 30 login or registration attempts per 15 minutes per address
- The client keeps its token in `localStorage`, which is simple but readable by any script on the page, so a production setup would use httpOnly cookies instead
