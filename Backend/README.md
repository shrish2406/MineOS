# MineOS Backend

Day 1 backend foundation for the Coal Mine Governance & Compliance Platform.

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `MONGODB_URI` and a strong `JWT_SECRET`.
3. Start MongoDB locally or provide a MongoDB connection string.
4. Run `npm run dev`.

The API listens on `http://localhost:5000` by default.

## Endpoints

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/mines` and `GET /api/mines/:id` (authenticated)
- `POST /api/mines` and `PATCH /api/mines/:id` (admin or mine_manager)
- `DELETE /api/mines/:id` (admin)

Send JWTs as `Authorization: Bearer <token>`.

The first registered account is bootstrapped as `admin`; later public registrations are `viewer` accounts.