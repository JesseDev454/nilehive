# Design System Document: The Executive Academic

## 1. Overview & Creative North Star
**Creative North Star: "The Prestigious Ledger"**
The visual identity of this design system moves away from the "generic SaaS dashboard" and toward a high-end, editorial experience. It is designed to feel like a digital extension of an elite campus—authoritative and organized, yet brimming with the energy of student life. 

Instead of rigid, boxed-in layouts, we utilize **The Prestigious Ledger** philosophy: an intentional use of white space, sophisticated tonal layering, and "breathable" hierarchy. We break the standard grid by using asymmetric content distribution and overlapping elements (like the subtle sunrise motif) to create a sense of movement and growth, reflecting the academic journey.

## 2. Colors & Surface Philosophy
The palette is grounded in the deep blues of Nile University, but its application must be nuanced to avoid looking "flat."

*   **Primary (`#000d27`) & Primary Container (`#0b2347`):** Use these for high-level structural anchors. They represent the "Deep Nile Navy" core of the institution.
*   **Secondary (`#0d5bbc`):** The "Primary Nile Blue." Reserved for administrative tools and high-trust interactive elements.
*   **Tertiary (`#001105` to `#002a13`):** The "Academic Green." This is our growth accent. Use it sparingly for success states or active student milestones.
*   **Sunrise Gold (`#F5B942`):** Our attention-grabber. Reserved for urgent reminders or "Golden Hour" highlights.

### The "No-Line" Rule
Standard 1px borders are strictly prohibited for sectioning. Structural definition must be achieved through:
1.  **Background Color Shifts:** Use `surface-container-low` (#f1f4f7) against a `surface` (#f7fafd) background.
2.  **Tonal Transitions:** Defining edges through color weight rather than outlines.

### Surface Hierarchy & Nesting
Think of the UI as a series of stacked, premium cardstock.
*   **The Foundation:** Use `background` (#f7fafd) for the canvas.
*   **The Content Block:** Place `surface-container-lowest` (#ffffff) cards on top.
*   **The Nested Detail:** Within a white card, use `surface-container` (#ebeef1) to highlight a specific metadata area. This "recessed" look adds depth without visual noise.

### The "Glass & Gradient" Rule
To elevate the platform, use Glassmorphism for floating navigation or mobile headers. Apply `on_surface` at 5% opacity with a `20px` backdrop blur. For Hero sections, utilize a subtle linear gradient from `primary` (#000d27) to `primary_container` (#0b2347) at a 135-degree angle to provide "visual soul."

## 3. Typography
We employ a dual-type system to balance institutional authority with modern readability.

*   **Display & Headline (Manrope):** High-impact, geometric, and authoritative. Use `display-lg` (3.5rem) for landing page headers and `headline-md` (1.75rem) for dashboard section titles. The wide apertures of Manrope convey openness and modernity.
*   **Title, Body, & Label (Inter):** Highly legible and neutral. `body-md` (0.875rem) is the workhorse for all administrative data. 
*   **The Editorial Scale:** Create high contrast by pairing a `headline-sm` title in `primary` with a `label-sm` subtitle in `on_surface_variant` (#44474e). This gap in scale creates a sophisticated, magazine-like feel.

## 4. Elevation & Depth
We eschew "standard" drop shadows in favor of natural, ambient light.

*   **The Layering Principle:** Depth is inherent in the color tokens. `surface-container-high` (#e5e8eb) objects naturally feel "closer" to the user than `surface-container-low` (#f1f4f7).
*   **Ambient Shadows:** For floating elements (Modals, Popovers), use a multi-layered shadow:
    *   `0px 4px 20px rgba(11, 35, 71, 0.06)` — Note the use of `primary_container` for the shadow tint instead of pure black.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use `outline_variant` at 20% opacity. It should be felt, not seen.
*   **The Sunrise Motif:** Integrate the sunrise motif as a low-opacity (#F5B942 at 10%) background element that "breaks" out of container bounds, creating an organic, unconfined aesthetic.

## 5. Components

### Buttons
*   **Primary:** Solid `secondary` (#0d5bbc) with `on_secondary` text. `lg` roundedness. 
*   **Secondary:** Ghost-style. No background, `secondary` text, and a `10% opacity secondary` hover state.
*   **Tertiary:** `surface-container-highest` background with `on_surface` text for low-priority actions.

### Cards & Lists
*   **Rule:** No dividers. Use `24px` or `32px` vertical padding to separate list items.
*   **Interaction:** On hover, a card should transition from `surface-container-lowest` to a subtle `surface-bright` with an ambient shadow.

### Input Fields
*   **Style:** Minimalist. No bottom line or full box. Use a `surface-container-low` fill with a `0.5rem` corner radius. The label should use `label-md` and sit high-contrast against the background.

### Custom Component: The "Club Pulse" Chip
*   A bespoke status indicator for club activity. It uses `tertiary_fixed` (#8af9ae) as a soft background with `on_tertiary_fixed` (#00210e) text. It features a "breathing" animation on the dot to signify an active, live session.

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical layouts. Let a header span 8 columns and the supporting text span 4, leaving purposeful gaps.
*   **Do** use "Sunrise Gold" for micro-interactions (e.g., a gold underline that grows when hovering over a navigation link).
*   **Do** prioritize vertical rhythm. Use a strict 8px spacing grid to ensure the "organized" feel.

### Don't
*   **Don't** use pure black (#000000) for text. Use `on_surface` (#181c1e) to maintain the premium, soft-ink look.
*   **Don't** use 100% opaque borders. They create "visual cages" that conflict with the student-friendly, open atmosphere.
*   **Don't** clutter the dashboard. If a piece of information isn't vital for the current user role, hide it within a `surface-container` layer accessible via interaction.