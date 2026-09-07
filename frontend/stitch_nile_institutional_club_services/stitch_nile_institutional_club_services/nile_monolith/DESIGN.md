# Design System Specification: Academic Neo-Brutalism

## 1. Overview & Creative North Star: "The Institutional Architect"

This design system is a sophisticated departure from the "soft" web. It is built on the philosophy of **The Institutional Architect**: a visual language that mirrors the physical weight, authority, and permanence of Nile University’s campus architecture. 

While standard Neo-Brutalism can often feel chaotic or "anti-design," this system is **Controlled**. We use bold, 2px-3px charcoal borders and hard-edge shadows to create a sense of structural integrity. We break the "template" look by treating the interface like a high-end academic journal—utilizing intentional asymmetry, heavy block-layering, and a rejection of the standard border-radius. Every element is unyielding, sharp, and intentional.

---

## 2. Colors & Tonal Architecture

Our palette is rooted in academic heritage. The contrast between deep institutional blues and warm, parchment-like creams creates an "Editorial" feel that feels premium rather than sterile.

### The Palette (Material Design Tokens)
*   **Primary (`#00030c`):** Our foundational ink. Used for bold borders and high-contrast text.
*   **Secondary (`#0c6b4f`):** "Nile Green." Reserved for success states, approved club statuses, and growth indicators.
*   **Tertiary (`#040200`):** "Academic Gold." Use sparingly for high-priority accents, leadership roles, and "Featured" badges.
*   **Surface Hierarchy:**
    *   `surface` (#fff9eb) & `surface-bright` (#fff9eb): Primary background.
    *   `surface-container-low` (#f9f3e5): Secondary sectioning.
    *   `surface-container-highest` (#e8e2d4): For nested block components.

### The "No-Line" Rule for Layout
While components use bold borders, **major layout sections must never use 1px lines.** Instead, sectioning is achieved through background shifts. A sidebar in `primary-container` (#071d3a) should sit directly against a `surface` (#fff9eb) main content area. The high-contrast color jump defines the boundary, keeping the layout clean and architectural.

### Signature Textures & Gradients
To avoid a flat "MS Paint" look, apply subtle gradients to primary CTAs. Transition from `primary` (#00030c) to `primary_container` (#071d3a) at a 45-degree angle. This adds a "visual soul"—a slight metallic depth that suggests prestige.

---

## 3. Typography: The Editorial Voice

We utilize a dual-font strategy to balance institutional authority with modern legibility.

*   **Headings (Work Sans):** Bold, structural, and assertive.
    *   `display-lg` (3.5rem) / `headline-lg` (2rem): Use these for page titles and major stats. Tighten the letter-spacing (-2%) for a "blocky" headline feel.
*   **Body & Labels (Inter):** Clean, utilitarian, and highly readable.
    *   `body-lg` (1rem): Standard reading text.
    *   `label-md` (0.75rem): All-caps with increased tracking (+10%) for metadata and status labels.

**The Hierarchy Rule:** Every page should have one "Hero" headline in `display-lg`. This anchors the grid and establishes the "Institutional Architect" voice immediately.

---

## 4. Elevation & Depth: Hard-Edge Layering

In this system, we do not use "fuzziness." We reject standard CSS box-shadows with blurs.

*   **The Layering Principle:** Depth is achieved by "stacking" surfaces. Place a `surface-container-lowest` card on top of a `surface-container-low` background to create a subtle, physical lift.
*   **Brutalist Hard Shadows:** When a component needs to "pop" (like a primary button or a focused card), use a **hard-offset shadow**.
    *   **Style:** Solid `primary` (#00030c) color, 4px offset (X and Y), 0px blur. 
*   **The "Ghost Border":** For non-interactive decorative elements, use the `outline-variant` (#c4c6ce) at 20% opacity. This provides a "hint" of a container without breaking the high-contrast flow of the page.

---

## 5. Components

### Buttons
*   **Primary:** Solid `primary` (#00030c) fill, `on-primary` (#ffffff) text. No radius (`0px`). 3px hard-offset shadow of `tertiary_fixed_dim`.
*   **Secondary:** `surface` (#fff9eb) fill, 2px `primary` border, `primary` text.
*   **States:** On hover, the hard shadow "collapses" (0px offset), making the button feel like it is being physically pressed into the page.

### Cards & Panels
*   **Structure:** All cards must have a 2px `primary` border.
*   **Header Bars:** Every card must include a "Header Bar"—a top section filled with `primary_container` or `surface-container-highest` with a bottom border of 2px. This creates a "blocky" dashboard aesthetic.
*   **Dividers:** Forbid the use of horizontal lines within a card. Use vertical white space or a slight background shift (`surface-variant`) to separate content blocks.

### Status Badges
*   **Visuals:** Rectangular, sharp edges (`0px` radius).
*   **Colors:** High-saturation backgrounds (`secondary` for approved, `error` for rejected) with 1px `primary` borders to ensure they "punch" through the UI.

### Steppers & Timelines
*   **Style:** Use thick (4px) vertical/horizontal lines in `primary`. Nodes should be large, square blocks (`0px` radius) rather than circles. This reinforces the "Academic Neo-Brutalism" theme of rigid structure.

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace the Grid:** Align every element to a strict 8px grid. Use "blocky" layouts where components feel like they are locked into a framework.
*   **Use Asymmetry:** A sidebar can be wider than expected, or a headline can be offset to the left to create a custom, editorial feel.
*   **Exaggerate Contrast:** If two elements are different, make them *very* different. Use `surface` next to `primary_container`.

### Don’t:
*   **No Rounded Corners:** Ever. The `roundedness` scale is strictly `0px`.
*   **No Soft Shadows:** If it’s not a hard, 0px-blur offset, it doesn't belong in this system.
*   **No "Playful" Fonts:** Avoid anything script or overly decorative. This is a platform for university services; it must feel dependable and official.
*   **No 1px Borders:** They feel "default" and thin. Use 2px for standard borders and 3px for emphasis.