---
name: Nile Clubs & Services
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#44474e'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#465f88'
  primary: '#000a1e'
  on-primary: '#ffffff'
  primary-container: '#002147'
  on-primary-container: '#708ab5'
  inverse-primary: '#aec7f6'
  secondary: '#1f6d0f'
  on-secondary: '#ffffff'
  secondary-container: '#a1f487'
  on-secondary-container: '#247114'
  tertiary: '#000d13'
  on-tertiary: '#ffffff'
  tertiary-container: '#002532'
  on-tertiary-container: '#648fa3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#aec7f6'
  on-primary-fixed: '#001b3d'
  on-primary-fixed-variant: '#2d476f'
  secondary-fixed: '#a4f78a'
  secondary-fixed-dim: '#89da71'
  on-secondary-fixed: '#022100'
  on-secondary-fixed-variant: '#0b5300'
  tertiary-fixed: '#bee9ff'
  tertiary-fixed-dim: '#a1cde3'
  on-tertiary-fixed: '#001f2a'
  on-tertiary-fixed-variant: '#1e4c5f'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-bold:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.4'
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding: 24px
  gutter: 20px
  border-width: 3px
  shadow-offset: 6px
---

## Brand & Style
The design system is a "Soft Neobrutalist" framework designed specifically for the student body at Nile University. It balances the academic authority of the institution with the high-energy, social nature of student life. 

The aesthetic is defined by high-contrast components, thick structural borders, and a playful, gamified interface. By softening the traditional harshness of neobrutalism with generous border radii and a calming sky-blue environment, the UI feels accessible and encouraging rather than aggressive. It evokes a sense of "Questing" through campus life, turning administrative tasks and club participation into a rewarding, visual journey.

## Colors
The palette is rooted in **Nile Blue**, providing a sophisticated foundation that honors university traditions. This is contrasted against **Quest Green**, used exclusively for success states, progress, and achievements to drive the gamified feel.

- **Nile Blue (Primary):** Used for structural borders, headings, and high-emphasis buttons.
- **Quest Green (Secondary):** Used for action items, progress bars, and "level-up" indicators.
- **Sky Tint (Tertiary):** The primary background color for the application canvas, providing a soft, low-strain environment for white cards to sit upon.
- **Surface White:** Used for card bodies to ensure maximum readability for content.

## Typography
This design system utilizes **Plus Jakarta Sans** for all roles to maintain a modern, friendly, and cohesive personality. The typography scales emphasizes heavy weights for headlines to stand up against the thick borders of the neobrutalist style.

- **Headlines:** Use Bold or ExtraBold weights with slight negative letter spacing to create a compact, "sticker-like" feel.
- **Body:** Use Medium weight for primary content to ensure it holds its own against the vibrant UI elements.
- **Labels:** Use uppercase and bold weights for small metadata, ensuring readability despite the small scale.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a 12-column structure on desktop and a single-column stacked model on mobile. 

Spacing is intentionally generous to prevent the heavy borders and offset shadows from feeling cluttered. All elements are built on an 8px stepping scale. 
- **The Shadow Gap:** Because components use offset shadows (6px), internal margins and gutters must be large enough to account for the "visual weight" of these offsets. 
- **Card Padding:** Standard cards should use a minimum of 24px internal padding to ensure content does not feel cramped against the thick 3px borders.

## Elevation & Depth
In this design system, depth is communicated through **Hard Offset Shadows** rather than blurs or gradients. This "Soft Neobrutalist" approach uses solid color blocks shifted on the X and Y axis.

- **The Offset:** All interactive elements (cards, buttons) feature a 6px offset to the bottom-right.
- **Shadow Color:** The shadow color is always the **Nile Blue** (Primary) at 100% opacity, or a slightly darker tint of the background for a softer feel.
- **Interactive State:** On hover, the offset shadow should decrease (e.g., to 2px) and the element should translate 4px towards the shadow, simulating a physical "press" into the page.

## Shapes
The shape language is defined by **Exaggerated Roundness**. While neobrutalism often uses sharp corners, this design system softens those edges to appear more youthful and "bubbly."

- **Small Components (Buttons, Chips):** Use a 18px radius.
- **Large Containers (Cards, Modals):** Use a 28px radius.
- **Borders:** Every container must have a visible 3px border using the Nile Blue color. No "borderless" cards are permitted.

## Components
Consistent component styling is vital for the gamified experience.

- **Neobrutalist Buttons:** Must have a 3px Nile Blue border and a 6px offset shadow. The fill color is either White (Primary Action) or Green (Success/Submit).
- **Quest Progress Bars:** The container is a 3px bordered "well" with a white or off-white background. The fill is solid Green with a sharp vertical termination (no rounded tip on the progress bar itself).
- **Achievement Chips:** Small, 18px rounded badges with icons. They use the Nile Blue border and vibrant background fills to signify different categories (e.g., "Social," "Academic," "Sports").
- **Playful Cards:** White surfaces with 28px corners. Every card should feature a label in the top-left corner using the `label-bold` type style, often styled as a physical "tab" or sticker.
- **Input Fields:** Thick borders with a focus state that changes the border color to Green and increases the offset shadow depth.