# AI Workforce Optimizer

A MERN-stack decision-support tool that helps managers allocate employees to projects.

## What it does

1. Managers add **employees** with skills (level 1–5) and weekly availability.
2. Managers add **projects** with a description and required skills.
3. An **AI assistant** reads the project and assigns an importance **weight** to each required skill.
4. A **transparent scoring function** (no AI) combines the weights with each employee's skills and availability to compute a **suitability score** (0–100).
5. The AI writes a short **explanation** for each top-ranked employee — but only using the numbers our code already computed.
6. Managers review the ranked list and **approve or reject** each proposed allocation.

## Why the AI is split in two

- **AI assigns weights** — it's good at reading a project description and judging relative importance.
- **Our code calculates the score** — it's deterministic, testable, and auditable.
- **AI explains the verdict** — it turns numbers into language, but it cannot invent skills.

This keeps the prediction transparent. "Running is not proof" — every number must be verifiable.

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite), `useState`/`useEffect`, `fetch` |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB Atlas (M0 free tier) |
| AI | OpenAI-compatible API, called only from the backend |
| Auth of secrets | `.env` (never committed) |

## Project structure
