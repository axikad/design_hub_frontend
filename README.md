# Textile Design Hub Marketplace

The customer and creator-facing web application for DesignHub. This project is intentionally separate from the Laravel administration panel.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- React Router
- TanStack Query
- Existing DesignHub Laravel API

## Local setup

```bash
npm install
copy .env.example .env
npm run dev
```

The default API base URL is `https://app.designshub.org/api/v1`. Override `VITE_API_BASE_URL` in `.env` when needed.

## Quality checks

```bash
npm run lint
npm run build
```

## Shared-hosting deployment

Run `npm run build`, then deploy the contents of `dist/`. The generated folder includes the SPA rewrite `.htaccess`, so direct links such as `/designs` and `/studio` resolve through `index.html`.

## Current milestone

- Responsive marketplace shell and navigation
- Premium marketplace home page
- API client and query provider foundation
- Routes prepared for designs, collections, studio, saved items, purchases, and login
- Production build configured for shared hosting

The next milestone connects authentication and the design catalogue to the existing API.
