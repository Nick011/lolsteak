# Role Management Page

This page provides a comprehensive interface for managing guild roles and permissions.

## Files Created

- `/app/(dashboard)/settings/roles/page.tsx` - Main role management page
- `/components/settings/role-editor.tsx` - Modal for creating/editing roles
- `/components/settings/permission-matrix.tsx` - Checkbox grid for permission management
- `/components/settings/index.ts` - Component exports

## Features

### Role List

- Displays all guild roles with visual color swatches
- Shows member count for each role
- Displays permission summary
- Expandable cards to view detailed permissions
- Admin and default role badges

### Drag-to-Reorder

- Uses Framer Motion's `Reorder` component for smooth drag interactions
- Alternative up/down arrow buttons for keyboard/mobile accessibility
- Visual drag handle indicator
- Automatically updates role `position` values

### Role Editor Dialog

- **Create Mode**: Opens empty form for new roles
- **Edit Mode**: Pre-fills form with existing role data
- **Fields**:
  - Name input (max 50 characters)
  - Color picker with 18 preset colors
  - Custom hex color input
  - Administrator toggle (grants all permissions)
  - Permission matrix (hidden when admin is enabled)
- **Delete**: Only available when:
  - Role is not a default role
  - Role has 0 members assigned

### Permission Matrix

- Organized by category (Members, Roles, Events, Loot, Announcements, Settings)
- Each category has multiple granular permissions
- Checkbox inputs with descriptions
- Disabled state support

### Permissions Structure

```typescript
interface RolePermissions {
  members?: {
    view?: boolean
    invite?: boolean
    kick?: boolean
    editNicknames?: boolean
    assignRoles?: boolean
  }
  roles?: {
    view?: boolean
    create?: boolean
    edit?: boolean
    delete?: boolean
    assign?: boolean
  }
  events?: {
    view?: boolean
    create?: boolean
    edit?: boolean
    delete?: boolean
    manageSignups?: boolean
  }
  loot?: {
    view?: boolean
    record?: boolean
    edit?: boolean
    delete?: boolean
    import?: boolean
  }
  announcements?: {
    view?: boolean
    create?: boolean
    edit?: boolean
    delete?: boolean
    pin?: boolean
  }
  settings?: {
    view?: boolean
    edit?: boolean
    manageIntegrations?: boolean
  }
}
```

## Design System

### Colors

- Background: `bg-slate-900`, `bg-slate-800/50`
- Borders: `border-slate-700`, `border-slate-600`
- Text: `text-white`, `text-slate-200`, `text-slate-400`
- Accents: `purple-600`, `purple-500` (primary actions)
- Badges: `amber-400` (admin), `blue-400` (default)

### Components Used

- `Dialog` - Modal wrapper with overlay
- `Card` - Role list item container
- `Button` - Actions and controls
- `Input` - Text inputs
- `Label` - Form labels
- `Separator` - Visual dividers

### Animations

- Framer Motion for:
  - Drag-to-reorder list
  - Card expand/collapse
  - Card entry/exit transitions

## Integration Points

### Backend (TODO)

- `GET /api/roles` - Fetch guild roles
- `POST /api/roles` - Create new role
- `PATCH /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role
- `PATCH /api/roles/reorder` - Update role positions

### State Management

Currently uses local React state with mock data. Replace with:

- tRPC queries for data fetching
- React Query for caching
- Server Actions for mutations

### Database Schema

Integrates with existing schema at `/packages/db/src/schema/roles.ts`:

- `roles` table
- `memberRoles` join table
- `RolePermissions` interface

## Accessibility

- Keyboard navigation for all interactive elements
- Focus management in dialogs
- ARIA labels on icon-only buttons
- Screen reader text for visual indicators
- Semantic HTML structure

## Future Enhancements

1. **Role Templates**: Pre-configured permission sets
2. **Bulk Role Assignment**: Assign roles to multiple members at once
3. **Role Inheritance**: Parent/child role hierarchies
4. **Permission Conflicts**: Visual warnings for conflicting permissions
5. **Audit Log**: Track role changes and permission updates
6. **Role Limits**: Enforce maximum number of roles per guild tier
7. **Export/Import**: JSON export for role configurations
