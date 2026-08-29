# Nukkad

Discover → Connect → Build → Opportunity. A platform for builders to discover people,
ideas, startups, and opportunities, and act on them.

This repository contains the two halves of the application:

- **[`frontend/`](frontend/)** — React 19 + TypeScript + Vite, Tailwind CSS v4. See
  [`frontend/README.md`](frontend/README.md) for stack details and setup.
- **[`backend/`](backend/)** — Spring Boot (Java 21), MySQL 8, Flyway migrations. See
  [`backend/HELP.md`](backend/HELP.md) for Spring Boot reference docs, and
  [`backend/.env.example`](backend/.env.example) for the environment variables the
  backend expects (copy to `.env` and fill in real values — never commit `.env`).

## Local development

Both projects run independently — start MySQL (see `backend/docker-compose.yml`), then
the backend (`./mvnw spring-boot:run` from `backend/`) and the frontend (`npm install &&
npm run dev` from `frontend/`).
