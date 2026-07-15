# EatWise

AI-powered meal planning app that generates personalized, day-by-day meal plans based on a user's health profile, dietary needs, and admin-defined nutrition rules.

![Landing Page](screenshots/landing.png)

## Overview

EatWise replaces static, one-size-fits-all meal suggestions with real AI generation. Users complete a health profile (goals, allergies, activity level, schedule), and the app uses Groq's LLM API to generate a full day of meals — complete with calories, ingredients, step-by-step recipes — tailored to that profile and any dietary rules an admin has configured.

## Features

- **Authentication** — register/login/logout with JWT (httpOnly cookie), role-based access (user/admin)
- **Health Profile Setup** — 4-step wizard (basic info, health & diet, food preferences, daily schedule) that drives AI generation
- **AI Meal Generation** — Groq-generated daily meal plans respecting calorie targets, allergies, forbidden foods, dietary preferences, and admin-defined dietary rules
- **Recipes** — each meal includes a real ingredient list and distinct step-by-step cooking instructions
- **Meal Tracking** — mark meals as eaten, track daily calorie consumption against target
- **History** — weekly calorie trend chart (based on calories actually eaten, not just planned), monthly calendar view, completion rate
- **Admin Dashboard** — user management, dietary rules management (create/edit/activate/deactivate), site overview stats
- **Dietary Rules** — admin-authored rules (e.g. "no added sugar for diabetic users") that get factored into AI generation and can be selected by users during setup

## Tech Stack

**Frontend**
- React 19 + TypeScript + Vite
- CSS Modules
- React Router

**Backend**
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT authentication (httpOnly cookies)
- Groq (via Vercel AI SDK `ai` + `@ai-sdk/groq`) for meal generation
- Zod for AI response schema validation
- express-validator for request validation

**Images**
- Foodish API (real food photography by category) with Lorem Flickr

## Project Structure

```
EatWise/
├── backend/
│   └── src/
│       ├── config/          # DB connection
│       ├── controllers/     # Route handlers
│       ├── middlewares/     # Auth, validation, error handling
│       ├── models/          # Mongoose schemas (User, HealthProfile, MealPlan, Meal, Rule)
│       ├── routes/          # Express routers
│       ├── scripts/         # One-off scripts (e.g. seedAdmin)
│       ├── services/        # Business logic incl. AI generation
│       ├── types/           # Shared TS types
│       ├── utils/           # Helpers (AppError, catchAsync, etc.)
│       └── validators/      # express-validator chains
└── frontend/
    └── src/
        ├── components/      # Shared UI (Button, Card, Badge, layouts, etc.)
        ├── lib/              # API client, auth context, utils
        ├── pages/            # Route-level pages (incl. admin/)
        └── routes/           # App routing
```

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB instance (local or Atlas)
- A Groq API key ([console.groq.com](https://console.groq.com))

### 1. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:
```
MONGODB_URI=mongodb://localhost:27017
DB_NAME=Eatwise
JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7
CLIENT_URL=http://localhost:5173
PORT=5000
NODE_ENV=development
GROQ_API_KEY=your_groq_api_key
```

Create your first admin account (edit the email/password constants at the top of `backend/src/scripts/seedAdmin.ts` first):
```bash
npm run seed:admin
```

Start the backend:
```bash
npm run dev
```

### 2. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`).

### 3. First run

1. Register a normal account (or log in with the seeded admin)
2. Complete the Setup wizard to create a health profile
3. Go to **Meal Plan** and click **Generate Plan**
4. As admin, visit **Admin → Rules** to add dietary rules, and **Admin → Users** to manage accounts


## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out |
| GET/PUT/DELETE | `/api/auth/me` | Current user profile |
| GET/PUT | `/api/health-profile` | Get/update health profile |
| GET/POST | `/api/meal-plans` | List/create meal plans |
| POST | `/api/meal-plans/:id/generate` | Generate AI meals for a plan |
| GET | `/api/meal-plans/:id/meals` | Get a plan's meals |
| PATCH | `/api/meals/:id/complete` | Toggle meal eaten status |
| GET/POST/PUT/DELETE | `/api/rules` | Dietary rules (admin write access) |
| GET/PUT/DELETE | `/api/users/:id` | Admin user management |
