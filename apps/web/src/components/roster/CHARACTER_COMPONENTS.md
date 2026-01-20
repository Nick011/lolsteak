# Character Management Components

This directory contains components for managing World of Warcraft characters in the Guild Platform.

## Components

### CharacterForm

A dialog component for adding and editing characters with comprehensive form validation.

**Location:** `/home/nick/Documents/projects/lolsteak/apps/web/src/components/roster/character-form.tsx`

**Features:**

- Add/Edit character dialog with dark theme styling
- Form fields: name, realm, class, spec, role, level
- "Set as Main" checkbox
- Class-based spec selection (dynamic spec dropdown based on selected class)
- Form validation with error states
- Framer Motion animations
- shadcn UI components (Dialog, Input, Select, Label, Button)

**Props:**

```typescript
interface CharacterFormProps {
  open: boolean // Control dialog visibility
  onOpenChange: (open: boolean) => void // Handle dialog state changes
  character?: Character | null // Character to edit (null for new)
  onSubmit: (data: CharacterFormData) => void | Promise<void> // Form submission handler
  isSubmitting?: boolean // Loading state
}

export interface CharacterFormData {
  name: string
  realm?: string
  class?: string
  spec?: string
  role?: string
  level?: number
  isMain?: boolean
}
```

**Usage:**

```tsx
import { CharacterForm, type CharacterFormData } from '~/components/roster'

function MyComponent() {
  const [open, setOpen] = useState(false)
  const createCharacter = api.character.create.useMutation()

  const handleSubmit = async (data: CharacterFormData) => {
    await createCharacter.mutateAsync(data)
    setOpen(false)
  }

  return (
    <CharacterForm
      open={open}
      onOpenChange={setOpen}
      onSubmit={handleSubmit}
      isSubmitting={createCharacter.isPending}
    />
  )
}
```

---

### CharacterCard

A card component that displays character information with WoW class colors and role badges.

**Location:** `/home/nick/Documents/projects/lolsteak/apps/web/src/components/roster/character-card.tsx`

**Features:**

- Displays character info with WoW class colors
- Shows: name, realm, class icon/color, spec, role badge, level
- "Main" badge for main characters
- Edit/Delete actions (for member's own characters or officers)
- Framer Motion hover animations and transitions
- Responsive layout

**Props:**

```typescript
interface CharacterCardProps {
  character: Character // Character data to display
  currentMemberId?: string // Current user's member ID
  canEdit?: boolean // Allow edit actions
  canDelete?: boolean // Allow delete actions
  onEdit?: (character: Character) => void // Edit handler
  onDelete?: (characterId: string) => void // Delete handler
}
```

**Usage:**

```tsx
import { CharacterCard } from '~/components/roster'

function MyRoster() {
  const { data: characters } = api.character.list.useQuery()
  const { data: member } = api.member.getCurrent.useQuery()
  const deleteCharacter = api.character.delete.useMutation()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {characters?.map(character => (
        <CharacterCard
          key={character.id}
          character={character}
          currentMemberId={member?.id}
          canEdit={true}
          canDelete={member?.role === 'officer' || member?.role === 'owner'}
          onEdit={handleEdit}
          onDelete={id => deleteCharacter.mutate({ id })}
        />
      ))}
    </div>
  )
}
```

---

## WoW Constants

Centralized constants for World of Warcraft data.

**Location:** `/home/nick/Documents/projects/lolsteak/apps/web/src/lib/wow-constants.ts`

**Exports:**

### Color Constants

- `WOW_CLASS_COLORS` - Blizzard's official class colors
- `WOW_ROLE_COLORS` - Role badge colors (tank/healer/dps)
- `WOW_ROLE_ICONS` - Lucide icons for each role

### Data Arrays

- `WOW_CLASSES` - Array of all WoW classes with labels
- `WOW_ROLES` - Array of all roles (tank/healer/dps)
- `WOW_CLASS_SPECS` - Mapping of classes to their specializations

### Helper Functions

```typescript
// Format class name for display
formatClassName(className: string): string

// Get class color classes
getClassColor(className: string | null): string

// Get role color classes
getRoleColor(role: string | null): string

// Get role icon component
getRoleIcon(role: string | null): LucideIcon
```

**Usage:**

```tsx
import {
  WOW_CLASSES,
  getClassColor,
  formatClassName,
} from '~/lib/wow-constants'

// Display class with color
const classColor = getClassColor('warrior') // 'bg-amber-700 text-amber-100'
const className = formatClassName('death_knight') // 'Death Knight'

// Iterate over classes
{
  WOW_CLASSES.map(wowClass => (
    <Badge key={wowClass.value} className={getClassColor(wowClass.value)}>
      {wowClass.label}
    </Badge>
  ))
}
```

---

## UI Components

### Select Component

A custom Select component built with Radix UI for dropdown selections.

**Location:** `/home/nick/Documents/projects/lolsteak/apps/web/src/components/ui/select.tsx`

**Features:**

- Dark theme styling (slate/purple)
- Keyboard navigation
- Scroll buttons for long lists
- Animated open/close transitions
- Checkmark indicator for selected item

**Usage:**

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
;<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

---

## Integration with tRPC

These components are designed to work seamlessly with the existing tRPC character router.

**Character Router:** `/home/nick/Documents/projects/lolsteak/packages/api/src/routers/character.ts`

**Available Procedures:**

- `character.list` - List all characters
- `character.get` - Get single character
- `character.create` - Create character
- `character.update` - Update character
- `character.delete` - Delete character (officers only)

**Example Integration:**

```tsx
'use client'

import { useState } from 'react'
import { api } from '~/trpc/react'
import {
  CharacterForm,
  CharacterCard,
  type CharacterFormData,
} from '~/components/roster'

export function CharactersPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editingChar, setEditingChar] = useState(null)

  // Queries
  const { data: characters } = api.character.list.useQuery()
  const { data: currentMember } = api.member.getCurrent.useQuery()

  // Mutations
  const createCharacter = api.character.create.useMutation({
    onSuccess: () => setFormOpen(false),
  })

  const updateCharacter = api.character.update.useMutation({
    onSuccess: () => {
      setFormOpen(false)
      setEditingChar(null)
    },
  })

  const deleteCharacter = api.character.delete.useMutation()

  const handleSubmit = async (data: CharacterFormData) => {
    if (editingChar) {
      await updateCharacter.mutateAsync({ id: editingChar.id, ...data })
    } else {
      await createCharacter.mutateAsync(data)
    }
  }

  return (
    <div>
      <Button onClick={() => setFormOpen(true)}>Add Character</Button>

      <div className="grid grid-cols-3 gap-4">
        {characters?.map(char => (
          <CharacterCard
            key={char.id}
            character={char}
            currentMemberId={currentMember?.id}
            canEdit
            canDelete={['owner', 'officer'].includes(currentMember?.role)}
            onEdit={char => {
              setEditingChar(char)
              setFormOpen(true)
            }}
            onDelete={id => deleteCharacter.mutate({ id })}
          />
        ))}
      </div>

      <CharacterForm
        open={formOpen}
        onOpenChange={setFormOpen}
        character={editingChar}
        onSubmit={handleSubmit}
        isSubmitting={createCharacter.isPending || updateCharacter.isPending}
      />
    </div>
  )
}
```

---

## Database Schema

Characters are stored with the following schema:

```typescript
// From: /home/nick/Documents/projects/lolsteak/packages/db/src/schema/characters.ts

wowClassEnum: [
  'warrior', 'paladin', 'hunter', 'rogue', 'priest',
  'shaman', 'mage', 'warlock', 'druid', 'death_knight'
]

wowRoleEnum: ['tank', 'healer', 'dps']

interface Character {
  id: string (uuid)
  tenantId: string
  memberId: string | null
  name: string (max 100)
  realm: string | null (max 100)
  class: wowClassEnum | null
  spec: string | null (max 50)
  role: wowRoleEnum | null
  level: number | null (1-80)
  gameData: CharacterGameData (jsonb)
  isMain: 'true' | 'false' (stored as text for RLS)
  createdAt: timestamp
  updatedAt: timestamp
}
```

---

## Styling & Theme

All components follow the dark theme with slate/purple color scheme:

**Colors:**

- Background: `bg-slate-800/50`, `bg-slate-900/50`
- Borders: `border-slate-700`
- Text: `text-slate-100`, `text-slate-300`, `text-slate-400`
- Accents: `bg-purple-600`, `hover:bg-purple-700`
- Focus: `focus:ring-purple-500`

**Animations:**
All components use Framer Motion for smooth animations:

- Cards: hover scale, fade in/out
- Buttons: rotation on hover
- Form: slide in from top
- Badges: spring animation

---

## File Structure

```
apps/web/src/
├── components/
│   ├── roster/
│   │   ├── character-form.tsx           # Character add/edit dialog
│   │   ├── character-card.tsx           # Character display card
│   │   ├── character-list.tsx           # Existing list component
│   │   ├── character-management-example.tsx  # Usage example
│   │   ├── member-card.tsx              # Existing member card
│   │   ├── role-badges.tsx              # Existing role badges
│   │   └── index.ts                     # Exports
│   └── ui/
│       ├── select.tsx                   # NEW: Select dropdown
│       ├── dialog.tsx                   # Existing
│       ├── input.tsx                    # Existing
│       ├── label.tsx                    # Existing
│       ├── button.tsx                   # Existing
│       └── badge.tsx                    # Existing
└── lib/
    └── wow-constants.ts                 # NEW: WoW data constants
```

---

## Dependencies

**Already Installed:**

- `framer-motion@^12.27.1` - Animations
- `@radix-ui/react-dialog` - Dialog component
- `@radix-ui/react-label` - Label component
- `lucide-react` - Icons

**Newly Installed:**

- `@radix-ui/react-select@^2.2.6` - Select dropdown

---

## Testing

Example usage component provided at:
`/home/nick/Documents/projects/lolsteak/apps/web/src/components/roster/character-management-example.tsx`

To test the components:

1. Import the example component into a page
2. Connect to your tRPC API
3. Uncomment the tRPC hooks
4. Test CRUD operations

---

## Next Steps

1. **Create a Characters Page** - Add route at `/apps/web/src/app/(dashboard)/characters/page.tsx`
2. **Add to Roster Page** - Integrate character management into existing roster
3. **Add Storybook Stories** - Document components in Storybook
4. **Add Tests** - Write unit tests with Vitest + React Testing Library
5. **Enhance Validation** - Add async validation for duplicate character names
6. **Add Filtering** - Allow filtering characters by class/role
7. **Add Sorting** - Sort by level, class, role, etc.

---

## Support

For issues or questions about these components, refer to:

- Character tRPC router: `/home/nick/Documents/projects/lolsteak/packages/api/src/routers/character.ts`
- Database schema: `/home/nick/Documents/projects/lolsteak/packages/db/src/schema/characters.ts`
- Example usage: `character-management-example.tsx`
