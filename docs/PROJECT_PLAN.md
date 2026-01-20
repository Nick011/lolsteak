# Guild Platform - Project Plan

## Vision

Multi-tenant guild/clan management platform for video game players and guild leaders.

### Full Vision (Long-term)
- Admins create guilds, invite users
- Multi-game support: WoW, CS2, LoL, Dota2, StarCraft, etc.
- Integrations: Discord, Gargul, Battle.net, Steam, Riot, etc.
- Users can be members of multiple guilds
- Features: profiles, raid planning, loot/gear tracking, tournaments, rosters, forums, FAQ

### MVP Scope
- **Single game**: World of Warcraft TBC
- **Single guild**: "Steak" (your current guild)
- Proof of concept before expanding

---

## Requirements (Captured from Discussion)

### Features (All Equally Important)
- **Raid scheduling & signups** - Full: roles + soft reserve + bench/standby
- **Loot tracking** - Gargul import, configurable loot system per guild
- **Roster management** - Members, characters, alts with main designation
- **Communication** - Forums, FAQ, guides, announcements

### Member Roles
- Fully custom (admins define their own)
- Sane defaults provided (Owner, Officer, Member, etc.)

### Loot System
- Configurable per guild
- Support: Loot Council, DKP, GDKP, Soft Reserve
- Steak will use: Soft Reserve or Loot Council

### Characters
- Members can have multiple characters (alts)
- One character designated as "main"
- Track class, spec, role, gear/gearscore

### Integrations (All Must-Have for MVP)
1. **Discord** - Full sync: role sync, channel management, interactive signups, slash commands
2. **Gargul** - Loot data import from addon
3. **Warcraft Logs** - Pull raid performance data
4. **Battle.net** - Character ownership verification

### Discord Bot Capabilities
- Auth (done)
- Post announcements to channels
- Interactive signups via reactions/threads
- Slash commands
- Role sync with guild roles
- Channel management

### Public Pages
- Full recruitment: public roster, apply to join, guild showcase
- Each guild gets a public-facing landing page

---

## Build Approach
**User Flow First**: onboarding → dashboard → features

---

## Phase 1: Foundation ✅ COMPLETE
- Bun + Turborepo monorepo
- Next.js 15 with App Router
- Drizzle ORM + PostgreSQL schema
- Docker Compose for local dev
- Auth.js with Discord OAuth
- Tenant resolution + multi-tenancy
- Vitest test suite (55 tests passing)

---

## Phase 2: User Onboarding & Core UI
*Build the complete user journey with basic functionality*

### 2.1 Landing & Marketing Pages
- [ ] Public landing page (/)
- [ ] Features overview
- [ ] Pricing (if applicable) or "Free for now"
- [ ] Login/signup CTA

### 2.2 Auth Flow Completion
- [ ] Sign in page polish
- [ ] Sign out functionality
- [ ] Session management
- [ ] Protected route middleware (done in Phase 1)

### 2.3 Guild Creation/Selection
- [ ] "Create Guild" flow for new users
- [ ] "Join Guild" flow (via invite link)
- [ ] Guild selector for users in multiple guilds
- [ ] Guild settings page (name, slug, game type, logo)

### 2.4 Dashboard Shell
- [ ] Dashboard layout with navigation
- [ ] Sidebar: Overview, Roster, Events, Loot, Forums, Settings
- [ ] Responsive design (mobile-friendly)
- [ ] User profile dropdown

---

## Phase 3: Roster & Character Management
*Core data that other features depend on*

### 3.1 Member Management
- [ ] Member list view
- [ ] Invite members (generate invite link)
- [ ] Member profile pages
- [ ] Custom roles system (CRUD)
- [ ] Assign roles to members
- [ ] Role permissions matrix

### 3.2 Character Management
- [ ] Character list per member
- [ ] Add/edit character (name, realm, class, spec, role)
- [ ] Set main character
- [ ] Character profile with game data
- [ ] (Later) Battle.net verification

---

## Phase 4: Events & Raid Planning
*Raid scheduling and signup system*

### 4.1 Event CRUD
- [ ] Create event (name, type, time, location, max size)
- [ ] Event list/calendar view
- [ ] Event detail page
- [ ] Edit/delete events
- [ ] Role requirements (X tanks, Y healers, Z dps)

### 4.2 Signup System
- [ ] Sign up with character
- [ ] Signup statuses: confirmed, tentative, declined, standby
- [ ] Role-based roster view (who's tanking, healing, etc.)
- [ ] Bench/standby management
- [ ] Signup notes

### 4.3 Soft Reserve Integration
- [ ] Enable soft reserve per event
- [ ] Item reservation UI
- [ ] Soft reserve limits
- [ ] View reserved items

---

## Phase 5: Loot Tracking
*Record and manage loot distribution*

### 5.1 Loot History
- [ ] Manual loot entry
- [ ] Loot list view (filterable by date, character, item)
- [ ] Loot detail (who got what, when, from which boss)

### 5.2 Gargul Import
- [ ] Import format research (CSV? JSON? Addon export?)
- [ ] Import UI (file upload or paste)
- [ ] Deduplication (import hash)
- [ ] Map to characters

### 5.3 Loot System Configuration
- [ ] Guild setting: loot system type
- [ ] DKP: point tracking, bidding
- [ ] Loot Council: voting/assignment UI
- [ ] Soft Reserve: tie into event SR

---

## Phase 6: Communication
*Forums, announcements, knowledge base*

### 6.1 Announcements
- [ ] Officer announcements feed
- [ ] Pin important announcements
- [ ] Announcement notifications

### 6.2 Forums
- [ ] Forum categories (General, Class Guides, etc.)
- [ ] Create/edit threads
- [ ] Reply to threads
- [ ] Rich text editor (markdown or WYSIWYG)

### 6.3 FAQ & Guides
- [ ] FAQ section with Q&A
- [ ] Guide pages (raid strats, class guides)
- [ ] Search functionality

---

## Phase 7: Discord Bot
*Full Discord integration*

### 7.1 Bot Infrastructure
- [ ] Discord.js bot setup in apps/discord-bot
- [ ] Bot authentication & permissions
- [ ] Connect bot to tenant

### 7.2 Notifications
- [ ] Post event announcements to channel
- [ ] Loot drop notifications
- [ ] New member notifications

### 7.3 Interactive Features
- [ ] Slash commands (/signup, /roster, /loot)
- [ ] Reaction-based signups
- [ ] Event threads

### 7.4 Sync Features
- [ ] Sync Discord roles ↔ guild roles
- [ ] Member sync (Discord → platform)

---

## Phase 8: External Integrations
*Third-party data sources*

### 8.1 Battle.net
- [ ] OAuth integration
- [ ] Character verification
- [ ] Pull character data (class, level, gear)

### 8.2 Warcraft Logs
- [ ] API integration
- [ ] Pull raid logs
- [ ] Performance metrics per character
- [ ] Link logs to events

### 8.3 Other Integrations
- [ ] ThatsMyBIS (wishlists)
- [ ] Softres.it

---

## Phase 9: Public Guild Pages
*Recruitment and public presence*

### 9.1 Public Guild Profile
- [ ] Guild landing page (/{slug})
- [ ] About, description, game
- [ ] Public roster (opt-in)
- [ ] Recruitment status

### 9.2 Applications
- [ ] Application form
- [ ] Application review (officers)
- [ ] Accept/reject flow

---

## Phase 10: Polish & Scale
*Production readiness*

### 10.1 Performance
- [ ] Database indexes
- [ ] Query optimization
- [ ] Caching (Redis)

### 10.2 Security
- [ ] Rate limiting
- [ ] Input validation audit
- [ ] RLS policies verification

### 10.3 Deployment
- [ ] Production environment
- [ ] CI/CD pipeline
- [ ] Monitoring & logging

---

## Project Meta

- **Hosting**: sherpa.sh
- **Timeline**: Side project, no rush
- **Domain**: TBD
- **Monetization**: TBD

---

## Files to Create/Modify for Phase 2

### New Files
- `apps/web/src/app/(public)/page.tsx` - Landing page
- `apps/web/src/app/(public)/features/page.tsx` - Features page
- `apps/web/src/app/auth/signin/page.tsx` - Sign in page
- `apps/web/src/app/auth/signout/page.tsx` - Sign out page
- `apps/web/src/app/(dashboard)/layout.tsx` - Dashboard layout
- `apps/web/src/app/(dashboard)/page.tsx` - Dashboard home
- `apps/web/src/app/(dashboard)/settings/page.tsx` - Guild settings
- `apps/web/src/app/guild/create/page.tsx` - Create guild flow
- `apps/web/src/app/guild/join/[code]/page.tsx` - Join guild flow
- `apps/web/src/components/ui/*` - UI component library

### Modify
- `apps/web/src/app/layout.tsx` - Add global providers/layout
- `packages/api/src/routers/tenant.ts` - Add guild CRUD operations

### Schema Changes (if needed)
- Add `inviteCode` to tenants table for join links
