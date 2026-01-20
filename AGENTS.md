# Agent Instructions

This project uses **bd** (beads) for issue tracking. Run `bd onboard` to get started.

## Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

## Git Worktrees

**ALWAYS** create worktrees in `.git/beads-worktrees/<branch>`:

```bash
git worktree add .git/beads-worktrees/<branch-name> -b <branch-name>
```

This keeps worktrees organized and prevents cluttering the project root.

## Testing Requirements

**MANDATORY**: You MUST write and maintain tests for ALL code changes.

**Framework:** This project uses **Vitest** for testing.

**Rules:**

- Every new feature requires corresponding tests
- When refactoring, update existing tests to match the new implementation
- Tests must cover happy paths and edge cases
- Run the full test suite before pushing: `bun test`
- **ALL tests must pass** before pushing to GitHub
- If tests fail, fix them before proceeding

**Never push code with failing tests.**

## UI Components

This project uses **shadcn/ui** for UI components and **Storybook** for component development.

### shadcn/ui

- **Always** use shadcn components from `~/components/ui/` instead of building custom components
- Add new components with: `bunx shadcn@latest add <component>`
- Components are in `apps/web/src/components/ui/`
- Configuration: `apps/web/components.json`

**Available components:** button, card, dialog, dropdown-menu, input, label, avatar, separator, sheet, tabs, form

### Storybook

- **Write stories for all new UI components**
- Stories location: `apps/web/src/components/ui/__stories__/`
- Run Storybook: `bun run storybook` (from apps/web)
- Build Storybook: `bun run build-storybook`

**Story file naming:** `<component>.stories.tsx`

### Component Guidelines

1. Use shadcn components as the foundation
2. Create stories for visual testing and documentation
3. Follow the existing component patterns
4. Use Tailwind CSS for styling (configured with shadcn theme)
5. Test components in Storybook before integrating into pages

### Animations & Motion

**Use Framer Motion** for all animations and transitions in the web app.

```tsx
import { motion } from 'framer-motion'

// Basic animation
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

**When to use Framer Motion:**

- Page transitions and route changes
- Component enter/exit animations
- Hover and tap interactions
- Layout animations (reordering lists, expanding cards)
- Scroll-triggered animations
- Drag and drop interactions
- Shared element transitions

**Animation best practices:**

1. Keep animations subtle and purposeful (200-400ms for micro-interactions)
2. Use `AnimatePresence` for exit animations
3. Prefer `layout` prop for smooth size/position changes
4. Use `whileHover` and `whileTap` for interactive feedback
5. Stagger children with `staggerChildren` in parent variants
6. Use `useReducedMotion` hook to respect accessibility preferences

**Don't use Framer Motion for:**

- Simple CSS transitions (use Tailwind's `transition-*` classes)
- Infinite looping animations (use CSS `@keyframes`)
- Performance-critical animations with many elements (consider CSS)

## Parallel Work & Sub-Agents

**ALWAYS** spawn sub-agents and perform work in parallel whenever possible.

- Use the `Task` tool to spawn specialized agents for independent tasks
- When multiple tasks have no dependencies, run them concurrently
- Break large tasks into smaller parallelizable units
- Examples of parallelizable work:
  - Writing tests for different modules
  - Implementing independent features
  - Reviewing multiple files
  - Running linters, type-checks, and tests simultaneously

## Quality Assurance

**ALWAYS** use PAL MCP to verify work quality.

- Use `mcp__pal__codereview` to review completed code changes
- Use `mcp__pal__analyze` for architectural decisions
- Use `mcp__pal__debug` when investigating issues
- Use `mcp__pal__testgen` when planning test coverage
- Run quality checks before marking tasks as complete

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**

- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
