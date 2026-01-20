# Guild Platform

Multi-tenant guild management platform for gaming communities, starting with WoW TBC guild "Steak".

## Tech Stack

- **Runtime**: Bun
- **Framework**: Next.js 15 (App Router)
- **API**: tRPC
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Auth.js (NextAuth v5) with Discord OAuth
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Component Dev**: Storybook
- **Testing**: Vitest

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.3+
- [Docker](https://docker.com) (for local Postgres/Redis)
- Discord OAuth credentials (for authentication)

### Setup

1. **Install dependencies**

   ```bash
   bun install
   ```

2. **Start Docker services**

   ```bash
   docker compose up -d
   ```

3. **Configure environment**

   ```bash
   cp apps/web/.env.example apps/web/.env.local
   # Edit .env.local with your Discord OAuth credentials
   ```

4. **Push database schema**

   ```bash
   bun run db:push
   ```

5. **Start development server**

   ```bash
   bun run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
lolsteak/
├── apps/
│   ├── web/                  # Next.js application
│   └── discord-bot/          # Discord bot (Phase 3)
├── packages/
│   ├── db/                   # Drizzle ORM schema
│   ├── api/                  # tRPC routers
│   └── types/                # Shared TypeScript types
├── docker-compose.yml        # Local dev (Postgres, Redis)
└── turbo.json                # Turborepo config
```

## Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run test` - Run tests (watch mode)
- `bun run test:run` - Run tests (single run)
- `bun run type-check` - Run TypeScript checks
- `bun run db:push` - Push schema to database
- `bun run db:studio` - Open Drizzle Studio

### Storybook

```bash
cd apps/web
bun run storybook      # Start Storybook dev server
bun run build-storybook # Build static Storybook
```

## UI Development

This project uses [shadcn/ui](https://ui.shadcn.com/) for UI components.

### Adding Components

```bash
cd apps/web
bunx shadcn@latest add <component-name>
```

### Available Components

button, card, dialog, dropdown-menu, input, label, avatar, separator, sheet, tabs, form

### Writing Stories

Create stories in `apps/web/src/components/ui/__stories__/` for visual testing and documentation.

```tsx
// button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '../button'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
}
export default meta

export const Default: StoryObj<typeof Button> = {
  args: { children: 'Click me' },
}
```

## Database

The schema includes:

- **Users** - User accounts with OAuth connections
- **Tenants** - Guild/clan organizations (multi-tenant)
- **Members** - User-tenant relationships with roles
- **Characters** - Game characters (WoW-specific fields + JSONB)
- **Events** - Raids, dungeons, social events
- **EventSignups** - Character signups for events
- **LootHistory** - Loot tracking with Gargul import support
- **Integrations** - Discord, Warcraft Logs, etc.

## Environment Variables

| Variable              | Description                  |
| --------------------- | ---------------------------- |
| `DATABASE_URL`        | PostgreSQL connection string |
| `AUTH_SECRET`         | NextAuth.js secret           |
| `AUTH_DISCORD_ID`     | Discord OAuth client ID      |
| `AUTH_DISCORD_SECRET` | Discord OAuth client secret  |

## License

MIT
