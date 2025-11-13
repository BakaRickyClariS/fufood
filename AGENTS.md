# Repository Guidelines

## Project Structure & Module Organization
- `src/`: application code (e.g., `components/`, `views/`, `router/`, `store/`, `assets/`).
- `public/`: static files served as‑is.
- `tests/`: unit/integration tests; mirrors `src/` structure.
- `dist/`: production build output (generated).
- `scripts/`: local utilities (optional).

## Build, Test, and Development Commands
- `npm ci` – install exact dependencies from lockfile.
- `npm run dev` – start local dev server with HMR.
- `npm run build` – production build to `dist/`.
- `npm run preview` – preview the built app locally.
- `npm run test` – run test suite.
- `npm run lint` / `npm run format` – check/fix style with ESLint/Prettier.

## Coding Style & Naming Conventions
- Indentation: 2 spaces; UTF‑8; LF endings.
- Use Prettier for formatting and ESLint for lint rules.
- Filenames: kebab‑case for files (`user-card.vue`), PascalCase for Vue components, camelCase for variables/functions, SCREAMING_SNAKE_CASE for env constants.
- Vue SFCs: `<script setup>` preferred; co‑locate small module styles using `<style scoped>`.

## Testing Guidelines
- Framework: Vitest or Jest; RTL for components.
- Test files: `*.spec.ts`/`*.spec.js` adjacent to source or under `tests/` mirroring paths (e.g., `src/utils/format.spec.ts`).
- Coverage: aim ≥ 80% on changed code; run `npm run test -- --coverage` before PRs.

## Commit & Pull Request Guidelines
- Commits follow Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
- Messages: imperative, present tense; first line ≤ 72 chars; include scope when useful (`feat(cart): add coupon flow`).
- PRs: clear description, linked issues (`Closes #123`), screenshots/GIFs for UI, steps to test, and notes on breaking changes or migrations.

## Security & Configuration Tips
- Never commit secrets. Use `.env`/`.env.local` (git‑ignored) and provide `.env.example`.
- Validate all external inputs; prefer typed APIs and centralized validators.

## Agent‑Specific Instructions
- Keep changes minimal and scoped; align with this guide.
- Update docs when adding commands or structure.
- When unsure, scan `package.json` scripts and existing patterns before adding new ones.
