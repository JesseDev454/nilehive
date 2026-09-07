# Club Services Developer Handoff Package

## 1. Design Summary: Rounded Neobrutalism
The redesign of **Club Services** (a module within the **CampusOne** platform) adopts a "Rounded Neobrutalist" aesthetic. This style combines the bold, high-contrast, and functional honesty of neobrutalism with softer, student-friendly ergonomics. 
- **Key Characteristics**: Thick black borders, soft offset shadows (not blurred), vibrant "Action Green" highlights, and generous corner radii (18px–28px).
- **Goal**: Create a gamified, quest-like experience that feels durable, modern, and highly legible for Nile University students and staff.

---

## 2. Color Tokens (Hex Codes)
| Token | Hex | Usage |
| :--- | :--- | :--- |
| `primary-blue` | `#002147` | Brand anchor, primary buttons, deep navy text |
| `action-green` | `#6CBB56` | Success states, highlights, primary CTAs |
| `surface-white` | `#FFFFFF` | Core card backgrounds |
| `surface-soft-blue` | `#F7F9FB` | Main app background (off-white/sky tint) |
| `sec-container` | `#A1F487` | Soft green background for success alerts/chips |
| `error-red` | `#BA1A1A` | Destructive actions, error states |
| `on-surface-variant`| `#44474E` | Muted body text, secondary labels |
| `border-color` | `#000000` | All component and card borders |
| `shadow-color` | `rgba(0,10,30,1)` | Offset shadow color |

---

## 3. Typography (Plus Jakarta Sans)
- **Display**: 44px / Bold / Tracking -2% (Dashboards/Headings)
- **Headline LG**: 32px / Bold / Tracking -1%
- **Headline MD**: 24px / Semi-Bold
- **Body LG**: 18px / Regular (Primary content)
- **Body MD**: 16px / Medium (Secondary content)
- **Label Bold**: 14px / Bold (Buttons, Chips, Labels)
- **Label SM**: 12px / Medium (Micro-copy)

---

## 4. Border & Shadow Tokens
- **Border Radius**: 
  - `round-sm`: 8px (Inner elements, small inputs)
  - `round-md`: 18px (Buttons, chips)
  - `round-lg`: 24px (Standard cards, modals)
  - `round-xl`: 28px (Large containers)
- **Borders**: 
  - `border-thin`: 1.5px
  - `border-base`: 3px (Standard for cards/buttons)
- **Shadows (Offset)**:
  - `shadow-sm`: 4px 4px 0px 0px (Buttons)
  - `shadow-md`: 6px 6px 0px 0px (Cards, Navbars)

---

## 5. Spacing Scale
- `space-1`: 4px
- `space-2`: 8px
- `space-4`: 16px (Standard gutter)
- `space-6`: 24px (Card padding)
- `space-8`: 32px (Section spacing)
- `space-12`: 48px (Container margin)

---

## 6. Component Specifications

### Buttons
- **Primary**: `bg-primary-blue`, `text-white`, `border-3`, `shadow-sm`, `hover:translate-x-[2px]`, `hover:translate-y-[2px]`, `hover:shadow-none`.
- **Action**: `bg-action-green`, `text-black`, `border-3`, `shadow-sm`.

### Cards & Metric Cards
- **Base Card**: `bg-white`, `border-3`, `shadow-md`, `rounded-lg`.
- **Metric Card**: Features an icon badge (bg-soft-blue), large number (Headline LG), and trend label (Label SM).

### Shell Layout (Side & Top Nav)
- **Sidebar**: Fixed 264px, `border-r-3`, vertical nav with `rounded-md` active states featuring offset shadows.
- **Top Bar**: Sticky, `h-16`, `border-b-3`, breadcrumbs/restart guide entries.

### Forms & Inputs
- **Inputs**: `border-3`, `rounded-sm`, `px-4 py-3`, focus ring `bg-action-green/20`.
- **Upload Areas**: Dashed `border-3`, `bg-soft-blue`, drag-and-drop icon.

---

## 7. Role-Based Screen Inventory

### Student
- `{{DATA:SCREEN:SCREEN_6}}` Dashboard
- `{{DATA:SCREEN:SCREEN_20}}` Discover Clubs
- `{{DATA:SCREEN:SCREEN_19}}` Mobile Home

### President
- `{{DATA:SCREEN:SCREEN_23}}` Dashboard
- `{{DATA:SCREEN:SCREEN_10}}` Onboarding Tour

### Executive
- `{{DATA:SCREEN:SCREEN_21}}` Task Detail View
- `{{DATA:SCREEN:SCREEN_15}}` Mobile Tasks

### Advisor
- `{{DATA:SCREEN:SCREEN_2}}` Dashboard
- `{{DATA:SCREEN:SCREEN_8}}` Proposal Review

### Admin / Club Services
- `{{DATA:SCREEN:SCREEN_11}}` Operations Dashboard
- `{{DATA:SCREEN:SCREEN_17}}` Analytics Detail
- `{{DATA:SCREEN:SCREEN_24}}` Mobile Analytics

### Specialized Flows
- **Paystack**: `{{DATA:SCREEN:SCREEN_14}}`
- **AI Support**: `{{DATA:SCREEN:SCREEN_22}}`
- **Notifications**: `{{DATA:SCREEN:SCREEN_13}}`
- **Design System Board**: `{{DATA:SCREEN:SCREEN_25}}`

---

## 8. Mobile Behavior Rules
- **Stacking**: All 3-column grids must stack to a single column on mobile.
- **Navigation**: Desktop Sidebar collapses; use Bottom Navigation (Home, Clubs, Events, Profile).
- **Modals**: Full-screen drawers (bottom-up) for filters and forms.
- **Touch Targets**: Minimum 48x48px for all interactive elements.

---

## 9. Accessibility Rules
- **Contrast**: Maintain WCAG AA compliance (4.5:1) for all primary text.
- **Focus**: Visible black focus rings (4px) on all interactive elements.
- **Labels**: Every icon-only button must have an `aria-label`.
- **Redundancy**: Use icons + text labels for all status badges (don't rely on color alone).

---

## 10. Implementation Notes
- **Tailwind Config**: Extend the theme with custom `borderWidth: { '3': '3px' }` and custom shadows.
- **Transitions**: All hover states use `transition-all duration-200 ease-out`.
- **Component Naming**: Follow the "Quest" naming convention (e.g., `QuestCard`, `ActionBadge`).
- **Icons**: Use Google Material Symbols (Rounded) for all iconography.