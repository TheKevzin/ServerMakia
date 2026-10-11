---
name: panel-ui-dev
description: >-
  Use this skill when developing, refactoring, or styling pages and components
  for the ServerMakia Next.js admin panel. Contains design system tokens,
  App Router conventions, and component guidelines.
---

# ServerMakia Panel UI & Frontend Development Skill

This skill guides the construction of premium, responsive, and robust UI components for the ServerMakia admin panel.

## Architecture Guidelines

1. **Routing (App Router)**:
   - All panel views belong under `app/(panel)/<feature>/page.tsx`.
   - Group layout is defined in `app/(panel)/layout.tsx` (Sidebar + TopBar + Auth protection).
   - Do NOT lift state to a single page. Use URL search parameters (`useSearchParams` wrapped in `Suspense`) or dedicated sub-routes (e.g. `players/[name]`).

2. **Type Safety & Constants**:
   - Import types exclusively from `@/types` (e.g. `Player`, `ServerStatus`, `FileNode`, `ConsoleLine`).
   - Import static navigation and configuration from `@/lib/constants`.
   - Never import from legacy `lib/data.ts`.

3. **Data Fetching & State**:
   - Use reusable hooks in `@/lib/hooks/`:
     - `useServerStatus()` for server ping & status polling.
     - `useAuth()` for user profile and role verification.
   - Favor custom hooks or SWR over ad-hoc `useEffect` + `fetch` inside presentation components.

## Design System & Aesthetics

- **Theme**: Dark cyberpunk / high-tech Minecraft dashboard.
- **Glassmorphism**:
  - `glass`: subtle frosted glass card background.
  - `glass-strong`: high-contrast backdrop blur for navigation and modals.
  - `neon-ring`: radiant purple/violet border glow on active interactive items.
- **Color Accents**:
  - Primary / Purple: `primary`, `end-stone` (Minecraft theme accents).
  - Status Indicators: Emerald (online/success), Amber (warning/degraded), Rose (offline/danger).
- **Icons**: Always use `lucide-react`. Keep icon sizes consistent (`size-4` for inline, `size-5` for menu/card headers).
- **Feedback**: Use `@/lib/toast` for actionable error or success notifications (`toast.success()`, `toast.error()`).
