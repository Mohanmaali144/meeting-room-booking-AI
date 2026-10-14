# Meeting Room Booking

A small app to view meeting rooms, book them without double-booking, cancel bookings and search for a free room. All times are UTC.

Stack: Node, Express, TypeScript, PostgreSQL (`pg`) on the backend. React + Vite on the frontend. Tests with Vitest.

## Setup

You need Node 20+ and a local PostgreSQL (the user must be able to create the `btree_gist` extension, which the default `postgres` user can).

```bash
cd backend
npm install
cp .env.example .env     # set your DATABASE_URL
createdb room_db
npm run db:setup         # creates tables and seeds the 5 rooms
npm run dev              # http://localhost:3000
```

In a second terminal:

```bash
cd frontend
npm install
npm run dev              # http://localhost:5173
```

`npm run db:reset` (in `backend`) drops and recreates the tables.

## Tests

```bash
cd backend && npm test
cd frontend && npm test
```

Backend tests use their own database named `<your database>_test`. It is created and reset automatically, so your dev data is not touched. Set `TEST_DATABASE_URL` to use another one.

## Structure

```
backend/src
  routes/        URLs
  controllers/   read the request, call a service, send the response
  validators/    check the data sent by the user
  services/      booking logic, and booking-rules.ts (the R1-R9 rules)
  repositories/  SQL queries
  middleware/    error handler
  utils/         AppError class and date helpers
  types/         Room and Booking types
  db/            schema.sql and setup script
frontend/src     App.tsx, components (DayView, BookingForm, FindRoom), api.ts, validation.ts
```

The rules in `services/booking-rules.ts` are plain functions. They only get data as arguments and throw an error with a code, so the tests do not need HTTP or a database.

## Data model

- `rooms`: id, name, capacity, floor, amenities
- `bookings`: id, room_id, title, organizer_email, attendees, start_time, end_time, status (`confirmed` / `cancelled`), created_at

## API

| Method | Path |
|---|---|
| GET | `/api/rooms` |
| GET | `/api/bookings?date=YYYY-MM-DD&roomId=` |
| POST | `/api/bookings` |
| DELETE | `/api/bookings/:id` |
| GET | `/api/availability?date=&start=HH:mm&end=HH:mm&minCapacity=` |

Errors look like `{ "error": { "code", "message", "details" } }`.

- 400: `VALIDATION_ERROR`, `INVALID_JSON`, `INVALID_TIME_RANGE` (R1), `INVALID_TIME_BOUNDARY` (R2), `INVALID_DURATION` (R3), `OUTSIDE_BUSINESS_HOURS` (R4), `BOOKING_IN_PAST` (R5), `CAPACITY_EXCEEDED` (R6)
- 404: `ROOM_NOT_FOUND`, `BOOKING_NOT_FOUND`
- 409: `BOOKING_CONFLICT` (R7), `BOOKING_ALREADY_STARTED` (R8), `DAILY_LIMIT_EXCEEDED` (R9)

## Concurrency

Booking is done inside one database transaction:

1. Take an advisory lock for the organizer and day (so R9 can't be beaten by parallel requests).
2. Take an advisory lock for the room, so bookings for one room are handled one at a time.
3. Read the existing bookings, run the rules, then insert.

The `bookings` table also has an exclusion constraint (`bookings_no_overlap`) that rejects overlapping confirmed bookings in the same room. So even if the application check was somehow skipped, Postgres will not store a double booking, and the error is turned into the same 409 response.

I first tried only the constraint, but with many simultaneous overlapping inserts Postgres sometimes detected a deadlock. The room lock removed that.

With several server instances nothing changes, because the locks and the constraint live in Postgres, not in the Node process. A per-process mutex would not work there.

`tests/concurrency.test.ts` sends 10 identical bookings at once (one succeeds), 6 overlapping ones (one succeeds) and 8 bookings from the same organizer (three succeed).

## Assumptions

- A booking belongs to the UTC day it starts on.
- A start exactly equal to "now" is allowed. A booking with start <= now counts as started and can't be cancelled.
- Organizer emails are compared case-insensitively for R9.
- `GET /api/bookings` needs a `date`. An unknown `roomId` gives 404.
- The availability search checks R1 to R4, not R5.
- Cancelling returns 200 with the booking. Cancelling twice returns 200 both times.

## Not done

- No authentication, so anyone can cancel any booking.
- No pagination.
- No browser end-to-end test.
- The schedule is a grouped list per room with a small timeline bar, not a full grid.
- No migration tool; `schema.sql` can be run repeatedly.

## Sources

PostgreSQL documentation (exclusion constraints, range types, `btree_gist`, advisory locks), and the Express, Vite, Vitest, Testing Library and Supertest docs. No booking/calendar library and no copied snippets.
