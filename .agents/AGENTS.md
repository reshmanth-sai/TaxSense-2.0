# TaxSense Product Design Guidelines & Rules

Follow this philosophy throughout every code change, UI layout, and feature refinement:

## Core Product Philosophy
- **AI-First**: Build around conversational clarity and contextual assistance rather than static grids of fields.
- **Human-Centered**: Align inputs and explanations to natural human expectations, keeping jargon hidden unless queried.
- **Progressive Disclosure**: Expose detail level on-demand. Show only the primary workflow details first. Never expose advanced variables, parameters, or configurations until they become necessary.
- **Minimal Cognitive Load**: Design with generous whitespace, readable rhythm, and stable typographic visual hierarchies.
- **Calm Interface**: Maintain a clean, dark-mode-first aesthetic with soft glows, frosted glass layouts, and uniform background textures. Avoid loud alerts, gaming patterns, or cyber-punk palettes.
- **Trust Before Features**: Ensure calculations are transparent, secure sandbox parameters are highlighted, and error messages are supportive rather than scary.

## Interface & Layout Constraints
- **One Goal, One Screen, One Primary Action**: Reorganize complex dashboard views into progressive linear workflows.
- **Subtle Visual Hierarchy**: Always direct focus to the primary next step. Use micro-interactions, spring animations, and volumetric spotlight gradients to naturally guide the user's eyes.
- **No Overload**: Avoid cluttered admin dashboard boxes. Keep widgets unified into a single canvas experience.

## Complete Design System Specification
All visual elements, layout structures, and styling configurations must strictly match the design system tokens documented in [design_system.md](file:///Users/sai/.gemini/antigravity/brain/196725ce-0d42-4a87-bf2d-f9e33ea18935/design_system.md).
Key Rules:
- Colors: Slate-950 canvas background, slate-100 text, slate-800 borders, blue-600/emerald-500/amber-500 accents.
- Typography: Inter for text, JetBrains Mono/SF Mono for monospaced figures.
- Corners & Borders: Large panels rounded by 24px, cards by 16px, inputs & buttons by 12px.
- Blurs: Frosted glass elements require 16px backdrop blurs.
- Tables: Flat borders, zero solid backgrounds, subtle vertical dividing exclusions.
- Motion: Use spring morphs (`stiffness: 350`, `damping: 30`) and hardware-accelerated transforms (transforms and opacity) only.


## Mandatory Skills

For every code change, always apply:

- react-architecture
- react-performance
- react-hooks
- composition-patterns
- typescript-best-practices
- frontend-design
- ui-ux-pro-max
- accessibility

Before implementing changes, evaluate the problem using these skills and follow their recommendations unless there is a strong reason not to.