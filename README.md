# Campus Hub Monorepo

This repo is organized into two top-level apps:

- `client/` - React + Vite frontend
- `server/` - Express + MongoDB API

## Common Commands

Run from the repo root:

```bash
npm run build:client
npm run dev:client
npm run dev:server
npm run seed:sample
npm run seed:full
npm run check:users
```

## Deployment

Render is configured through [`render.yaml`](./render.yaml) to build the frontend from `client/` and start the backend from `server/`.

