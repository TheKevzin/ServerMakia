# ServerMakia — Workspace Guidelines & Rules

Welcome to ServerMakia. All assistants and developers must adhere to the following architecture rules and conventions.

## 1. Project Organization
- `Panel Admin/`: Next.js 16 App Router administrative dashboard.
- `Server/`: Dedicated Minecraft Fabric server runtime, configs, and plugins.
- `scripts/`: Operational automation scripts (e.g., PowerShell, Bash).
- `docs/`: Technical documentation and setup guides.
- Do NOT place server JSON files (`ops.json`, `whitelist.json`, etc.) or archives in the repository root.

## 2. Admin Panel Architecture
- **App Router**: Use route groups `app/(panel)/` with dedicated `page.tsx` files for each section (`/dashboard`, `/console`, `/players`, `/files`, `/backups`, `/settings`, `/users`).
- **Layout & Navigation**: Shared sidebar and header live in `app/(panel)/layout.tsx`. Use Next.js `<Link>` with `href` attributes rather than synthetic state toggling.
- **Types**: Always import domain types from `@/types` (`types/index.ts`).
- **Constants**: Keep app constants in `@/lib/constants.ts`.
- **Server Config**: Centralize all path resolution through `@/lib/server-config` (`SERVER_DIR`, `WORLD_DIR`). Never hardcode relative filesystem paths in API routes.

## 3. Security & Secrets
- Never commit `.env*`, `.db`, `*.zip`, `.tunnel-url`, `.webhook-url`, or `drive-config.json` to version control.
- Reference all configurable credentials through environment variables with fallbacks specified in `.env.example`.
- All administrative panel routes are guarded by `middleware.ts` verifying JWT session tokens.
