# ContentOS Server

## Install

```bash
cd server
npm install
```

## Env Setup

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — any long random string
- `PORT` — defaults to 5000
- `CLIENT_ORIGIN` — React dev URL, defaults to http://localhost:5173

## Run

```bash
# Development (nodemon)
npm run dev

# Production
npm start
```
