# Learn CSS — Proper Written Tutorial

## Sections

- [Intro (0:00:00)](#intro-000000)
- [Chapter 1: Start Here (0:00:41)](#chapter-1-start-here-000041)
- [Chapter 2: Selectors (0:14:23)](#chapter-2-selectors-001423)
- [Chapter 3: Colors (0:34:14)](#chapter-3-colors-003414)
- [Chapter 4: Units & Sizes (0:50:46)](#chapter-4-units--sizes-005046)
- [Chapter 5: Box Model (1:11:29)](#chapter-5-box-model-011129)
- [Chapter 6: Typography (1:36:41)](#chapter-6-typography-013641)
- [Chapter 7: Styling Links (2:00:02)](#chapter-7-styling-links-020002)
- [Chapter 8: List Styles (2:16:10)](#chapter-8-list-styles-021610)
- [Chapter 9: Mini Project (2:32:04)](#chapter-9-mini-project-023204)
- [Chapter 10: Display (2:44:37)](#chapter-10-display-024437)
- [Chapter 11: Floats (2:59:54)](#chapter-11-floats-025954)
- [Chapter 12: Columns (3:12:19)](#chapter-12-columns-031219)
- [Chapter 13: Position (3:34:03)](#chapter-13-position-033403)
- [Chapter 14: Flexbox (3:57:26)](#chapter-14-flexbox-035726)
- [Chapter 15: Grid Layout (4:21:12)](#chapter-15-grid-layout-042112)
- [Chapter 16: Images (4:46:06)](#chapter-16-images-044606)
- [Chapter 17: Media Queries (5:32:13)](#chapter-17-media-queries-053213)
- [Chapter 18: Card Project (5:58:32)](#chapter-18-card-project-055832)
- [Chapter 19: Pseudo (6:32:54)](#chapter-19-pseudo-063254)
- [Chapter 20: Variables (6:52:29)](#chapter-20-variables-065229)
- [Chapter 21: Functions (7:20:01)](#chapter-21-functions-072001)
- [Chapter 22: Animations (7:49:38)](#chapter-22-animations-074938)
- [Chapter 23: Organization (8:37:06)](#chapter-23-organization-083706)
- [Chapter 24: Final Project (8:56:56)](#chapter-24-final-project-085656)

## Intro (0:00:00)

This course is a complete CSS path made of 24 chapters. Each chapter builds on the previous one, so you should follow them in order and practice the examples as you go.

---

## Chapter 1: Start Here (0:00:41)

### What you learn

You learn what CSS is, how it differs from HTML, and the three ways to apply styles: external, internal, and inline. You also set up VS Code, Live Server, and a basic `index.html` + `css/style.css` project.

### Guided tutorial

1. Create a project folder and add `index.html`.
2. Use Emmet `!` to scaffold a base HTML page.
3. Add a paragraph, such as “I’m learning CSS!”
4. Create `css/style.css` and link it in `<head>`.
5. Add your first rule (`p { color: purple; }`) and confirm it in the browser.
6. Compare external CSS, internal `<style>`, and inline `style=""`.
7. Keep external CSS as the default workflow for clean separation of concerns.

### Term-definition pairs

| Pair | Definition |
|---|---|
| `rel="stylesheet"` | Tells the browser the linked file is a stylesheet. |
| `href="css/style.css"` | Points to the external CSS file path. |
| `color: purple;` | Sets text color to purple. |
| `font-size: 64px;` | Sets text size to 64 pixels. |
| `style="color: blue"` | Inline style applied directly to one element. |

---

## Chapter 2: Selectors (0:14:23)

### What you learn

You learn element selectors, class selectors, and ID selectors, then compare their specificity and behavior.

### Guided tutorial

1. Start with an element selector on `body` to set a base font size.
2. Apply an element selector on `p` and observe that all paragraphs update.
3. Add a class selector (`.gray`) and apply it to selected paragraphs.
4. Add an ID selector (`#second`) for one unique element.
5. Group selectors with commas (`h1, h2`) and compare with descendant selectors (`h1 h2`).

### Term-definition pairs

| Pair | Definition |
|---|---|
| `font-size: 22px;` | Sets base text size on the selected element. |
| `color: purple;` | Colors all elements matched by the selector. |
| `class="gray"` | Assigns reusable class name `gray`. |
| `color: gray;` | Colors class-matched elements gray. |
| `id="second"` | Gives a unique element ID. |
| `font-style: italic;` | Displays text in italic style. |

---

## Chapter 3: Colors (0:34:14)

### What you learn

You learn color systems used in CSS: named colors, RGB, HSL, and hex. You also learn how to choose contrast for readable UI.

### Guided tutorial

1. Apply named colors first to understand visual differences quickly.
2. Switch to hex and RGB for precise control.
3. Use HSL when you want easy hue/saturation/lightness tuning.
4. Test text and background combinations for readability.

### Term-definition pairs

| Pair | Definition |
|---|---|
| `color: red;` | Sets text color using a named value. |
| `color: #333333;` | Sets text color with a 6-digit hex value. |
| `background-color: rgb(0, 0, 0);` | Sets background to black using RGB. |
| `color: hsl(120, 100%, 50%);` | Sets color in HSL format. |

---

## Chapter 4: Units & Sizes (0:50:46)

### What you learn

You learn the difference between absolute units (`px`) and relative units (`%`, `rem`, `em`, `vw`) and when each one is appropriate.

### Guided tutorial

1. Set font size with pixels to see fixed sizing.
2. Set widths with `%` to see parent-relative sizing.
3. Use `rem` for consistent scalable typography.
4. Use `em` for component-relative sizing.
5. Add a global reset and `box-sizing` for predictable layout calculations.

### Term-definition pairs

| Pair | Definition |
|---|---|
| `font-size: 32px;` | Absolute text size in pixels. |
| `width: 50%;` | Width equals half of parent width. |
| `font-size: 1rem;` | Size relative to root font size. |
| `font-size: 2em;` | Size relative to current element font size. |
| `box-sizing: border-box;` | Includes padding and border in width/height. |
| `margin: 0;` | Removes external default spacing. |
| `padding: 0;` | Removes internal default spacing. |

---

## Chapter 5: Box Model (1:11:29)

### What you learn

You learn how content, padding, border, and margin combine to create the final rendered size of an element.

### Guided tutorial

1. Build a `.container` block.
2. Add padding and border to visualize inner spacing.
3. Add margin to control outer spacing.
4. Compare outline vs border.
5. Recalculate element size mentally with each layer.

### Term-definition pairs

| Pair | Definition |
|---|---|
| `class="container"` | Assigns container styles to the element. |
| `padding: 1.5rem;` | Adds inside spacing. |
| `border: 2px solid black;` | Adds a visible border around content+padding. |
| `margin: 2em;` | Adds outside spacing around the element. |
| `outline: 2px solid red;` | Draws a line outside border without affecting box size. |

---

## Chapter 6: Typography (1:36:41)

### What you learn

You learn how to make text readable and visually balanced using `font-family`, `font-size`, `line-height`, and `font-weight`.

### Guided tutorial

1. Set a readable base font and fallback stack.
2. Increase heading sizes with scalable units.
3. Tune line-height for body text rhythm.
4. Adjust weight for contrast between headings and paragraphs.
5. Use spacing properties (letter/word spacing) carefully.

### Term-definition pairs

| Pair | Definition |
|---|---|
| `font-family: Arial, sans-serif;` | Sets primary font and fallback. |
| `font-size: 2rem;` | Scales text from root size. |
| `line-height: 1.5;` | Controls vertical spacing between lines. |
| `font-weight: 400;` | Uses normal font weight. |
| `letter-spacing: 0.05em;` | Adds spacing between letters. |

---

## Chapter 7: Styling Links (2:00:02)

### What you learn

You learn to style link states for usability and accessibility: normal, visited, hover, active, and focus.

### Guided tutorial

1. Style the base `a` appearance.
2. Add `:visited` to differentiate visited pages.
3. Add `:hover` and `:active` feedback.
4. Add `:focus` or `:focus-visible` for keyboard users.
5. Keep strong contrast in every state.

### Term-definition pairs

| Pair | Definition |
|---|---|
| `color: blue;` | Base link color. |
| `color: purple;` | Typical visited link color. |
| `text-decoration: none;` | Removes underline. |
| `outline: 2px solid currentColor;` | Adds visible keyboard focus ring. |
| `text-decoration: underline;` | Restores explicit link affordance when needed. |

---

## Chapter 8: List Styles (2:16:10)

### What you learn

You learn to style unordered/ordered lists, customize markers, and align list content for clean UI sections.

### Guided tutorial

1. Remove default list spacing where necessary.
2. Set marker style with `list-style-type`.
3. Move markers inside or outside with `list-style-position`.
4. Center or align list text based on layout.
5. Optionally replace markers with images.

### Term-definition pairs

| Pair | Definition |
|---|---|
| `list-style-type: square;` | Uses square bullets. |
| `list-style-position: inside;` | Places markers inside content flow. |
| `padding: 0;` | Removes default indentation. |
| `text-align: center;` | Centers list text. |
| `list-style-image: url("marker.png");` | Uses image markers. |

---

## Chapter 9: Mini Project (2:32:04)

### What you learn

You combine fundamentals into a practical navigation-style mini project with spacing, typography, and alignment.

### Guided tutorial

1. Apply global reset and base typography.
2. Create a centered container with max width.
3. Build list-based navigation structure.
4. Style links, borders, and spacing for visual hierarchy.
5. Refine hover/focus states and alignment.

### Term-definition pairs

| Pair | Definition |
|---|---|
| `max-width: 600px;` | Caps layout width. |
| `margin: 0 auto;` | Centers block horizontally. |
| `border-radius: 2rem;` | Rounds corners for softer UI. |
| `padding: 1rem;` | Creates internal space. |
| `text-decoration: none;` | Removes default link underline. |

---

## Chapter 10: Display (2:44:37)

### What you learn

You learn display behaviors (`block`, `inline`, `inline-block`) and how each affects box dimensions and flow.

### Guided tutorial

1. Compare block and inline elements side-by-side.
2. Switch to `inline-block` to combine inline flow with sizing control.
3. Set widths/heights and observe differences.
4. Use background colors to visualize element boxes.

### Term-definition pairs

| Pair | Definition |
|---|---|
| `display: block;` | Element starts on a new line and can fill width. |
| `display: inline;` | Element stays in text flow and ignores width/height. |
| `display: inline-block;` | Inline flow with box sizing control. |
| `width: 50%;` | Sets element width to half its parent. |

---

## Chapter 11: Floats (2:59:54)

### What you learn

You learn float-based layout behavior and how to restore normal flow with clear rules.

### Guided tutorial

1. Float boxes left/right and observe text wrapping.
2. Use fixed or responsive widths for floated elements.
3. Add `clear` on following content to stop wrapping.
4. Understand where floats are still useful in legacy layouts.

### Term-definition pairs

| Pair | Definition |
|---|---|
| `float: left;` | Pushes element to left and lets content wrap. |
| `float: right;` | Pushes element to right. |
| `clear: both;` | Moves element below prior floats. |
| `width: 30vw;` | Uses viewport-relative width. |

---

## Chapter 12: Columns (3:12:19)

### What you learn

You learn multi-column text layout and how to control column count, spacing, and separators.

### Guided tutorial

1. Apply `column-count` for newspaper-style layout.
2. Add `column-gap` for breathing room.
3. Add `column-rule` to separate columns.
4. Prevent awkward wraps for short headings.

### Term-definition pairs

| Pair | Definition |
|---|---|
| `column-count: 4;` | Splits text into four columns. |
| `column-gap: 2rem;` | Sets spacing between columns. |
| `column-rule: 3px solid #333;` | Draws divider lines between columns. |
| `white-space: nowrap;` | Prevents text wrapping on one line. |
| `margin-top: 0;` | Removes extra top spacing. |

---

## Chapter 13: Position (3:34:03)

### What you learn

You learn positioning modes and offset properties for precise element placement in documents and viewports.

### Guided tutorial

1. Compare static vs relative positioning.
2. Place child elements with absolute positioning inside a positioned parent.
3. Use fixed for sticky headers/footers that stay in view.
4. Use sticky for scroll-aware section elements.

### Term-definition pairs

| Pair | Definition |
|---|---|
| `position: relative;` | Keeps element in flow but enables offsets. |
| `position: absolute;` | Positions against nearest positioned ancestor. |
| `position: fixed;` | Locks element to viewport. |
| `top: 0;` | Aligns to top reference edge. |
| `bottom: 0;` | Aligns to bottom reference edge. |
| `width: 100%;` | Spans full available width. |

---

## Chapter 14: Flexbox (3:57:26)

### What you learn

You learn one-dimensional layout with flex containers and flexible items, including alignment and space distribution.

### Guided tutorial

1. Turn a container into a flex context.
2. Set direction and wrapping behavior.
3. Align items on main and cross axes.
4. Control item growth/shrink/basis.
5. Build practical row and column patterns.

### Term-definition pairs

| Pair | Definition |
|---|---|
| `display: flex;` | Enables flex formatting context. |
| `flex-direction: row;` | Sets main axis horizontally. |
| `flex-wrap: wrap;` | Allows items to wrap to new lines. |
| `justify-content: center;` | Aligns items along main axis. |
| `align-items: center;` | Aligns items on cross axis. |
| `flex: 1;` | Allows item to grow and shrink. |
| `flex-basis: 250px;` | Sets initial item size before flexing. |

---

## Chapter 15: Grid Layout (4:21:12)

### What you learn

You learn two-dimensional layout with CSS Grid: rows, columns, gaps, and named template areas.

### Guided tutorial

1. Set `display: grid` on the main layout wrapper.
2. Define columns with `repeat()` and fractional units.
3. Add gap spacing.
4. Place sections with area names or line-based placement.
5. Build a complete page shell (header/main/sidebar/footer).

### Term-definition pairs

| Pair | Definition |
|---|---|
| `display: grid;` | Enables grid layout. |
| `grid-template-columns: repeat(3, 1fr);` | Creates 3 equal columns. |
| `gap: 1rem;` | Sets row/column spacing. |
| `grid-auto-rows: minmax(150px, auto);` | Responsive row sizing rule. |
| `grid-template-areas: "hd hd hd" "mn mn sb" "ft ft ft";` | Named area map for page regions. |

---

## Chapter 16: Images (4:46:06)

### What you learn

You learn responsive image techniques, object fitting, and common layout patterns with images and captions.

### Guided tutorial

1. Prevent overflow with responsive sizing defaults.
2. Keep aspect ratio stable.
3. Align inline image behavior with block display where needed.
4. Add overlays and caption positioning when required.

### Term-definition pairs

| Pair | Definition |
|---|---|
| `max-width: 100%;` | Keeps image inside container width. |
| `height: auto;` | Preserves aspect ratio during scaling. |
| `display: block;` | Removes inline-gap behavior. |
| `position: absolute;` | Positions overlays on image containers. |
| `class="off"` | Applies an alternate class state. |

---

## Chapter 17: Media Queries (5:32:13)

### What you learn

You learn responsive breakpoints and conditional styling for width and orientation changes.

### Guided tutorial

1. Start mobile-first with base styles.
2. Add progressive `min-width` breakpoints.
3. Update layout structures (stacked to row/grid).
4. Add orientation-specific refinements.
5. Test transitions across viewport sizes.

### Term-definition pairs

| Pair | Definition |
|---|---|
| `@media (min-width: 576px)` | Applies styles at 576px and above. |
| `@media (min-width: 768px)` | Applies styles at 768px and above. |
| `@media (orientation: landscape)` | Applies styles in landscape mode. |
| `display: none;` | Hides selected elements at a breakpoint. |
| `width: 100%;` | Uses full available width in responsive state. |

---

## Chapter 18: Card Project (5:58:32)

### What you learn

You build a full card layout project using flex/grid patterns, reusable utility styles, and responsive adjustments.

### Guided tutorial

1. Build card markup with image, heading, and body content.
2. Apply spacing and consistent card dimensions.
3. Use flex direction changes across breakpoints.
4. Align card groups and equalize card heights.
5. Polish with states, borders, and typography.

### Term-definition pairs

| Pair | Definition |
|---|---|
| `id="profile"` | Targets profile section uniquely. |
| `display: flex;` | Arranges card internals as flex items. |
| `flex-direction: column;` | Stacks content vertically. |
| `width: 33%;` | Makes three cards per row on wider screens. |
| `align-items: stretch;` | Equalizes cross-axis item size. |
| `height: 500px;` | Sets fixed card height. |

---

## Chapter 19: Pseudo (6:32:54)

### What you learn

You learn pseudo-classes and pseudo-elements for interactions and generated styling hooks.

### Guided tutorial

1. Style interactive states with pseudo-classes.
2. Target structural positions with `:nth-child()`.
3. Inject decorative content with `::before` and `::after`.
4. Keep pseudo-content semantic and minimal.

### Term-definition pairs

| Pair | Definition |
|---|---|
| `:hover` | Applies style on mouse hover. |
| `:focus-visible` | Applies style for keyboard-visible focus. |
| `:nth-child(odd)` | Targets odd items in a list. |
| `content: "";` | Required to render pseudo-element boxes. |
| `::before` | Inserts generated content before element content. |
| `::after` | Inserts generated content after element content. |

---

## Chapter 20: Variables (6:52:29)

### What you learn

You learn CSS custom properties for theme control, reduced duplication, and easier maintenance.

### Guided tutorial

1. Define variables in `:root`.
2. Use `var()` in component rules.
3. Override variables in scoped contexts.
4. Build light/dark style themes with variable swaps.

### Term-definition pairs

| Pair | Definition |
|---|---|
| `--primary-color: #222;` | Defines a reusable custom property. |
| `--accent-color: #0f0;` | Stores accent value for reuse. |
| `color: var(--primary-color);` | Reads a custom property into color. |
| `background: var(--accent-color);` | Reads a custom property into background. |

---

## Chapter 21: Functions (7:20:01)

### What you learn

You learn CSS functions that make values adaptive: `calc()`, `min()`, `max()`, `clamp()`, and modern color forms.

### Guided tutorial

1. Use `calc()` for mixed-unit calculations.
2. Use `min()` and `max()` for bounds.
3. Use `clamp()` for fluid type and spacing.
4. Combine functions with responsive units for scalable layouts.

### Term-definition pairs

| Pair | Definition |
|---|---|
| `height: calc(100vh - 4rem);` | Computes value from viewport and rem units. |
| `width: min(100%, 70ch);` | Chooses smaller of two values. |
| `width: max(320px, 50%);` | Chooses larger of two values. |
| `font-size: clamp(1rem, 2vw, 1.5rem);` | Fluid size with minimum and maximum limits. |

---

## Chapter 22: Animations (7:49:38)

### What you learn

You learn transitions, keyframes, and interactive animation patterns for menus and UI motion.

### Guided tutorial

1. Start with transitions on hover/focus changes.
2. Build a named keyframe animation.
3. Control duration, timing, delay, and fill behavior.
4. Add transform/opacity effects for smooth motion.

### Term-definition pairs

| Pair | Definition |
|---|---|
| `transition: all 0.5s ease;` | Animates style changes smoothly. |
| `animation: slide-in 2s linear;` | Runs `slide-in` keyframes over 2 seconds. |
| `transform: translateX(100%);` | Moves element along X axis. |
| `opacity: 0;` | Makes element fully transparent. |
| `border: none;` | Removes button border. |
| `background: transparent;` | Makes background fully transparent. |

---

## Chapter 23: Organization (8:37:06)

### What you learn

You learn how to structure CSS files for real projects with base styles, utilities, components, and layout sections.

### Guided tutorial

1. Separate reset/base styles from components.
2. Keep utility classes small and single-purpose.
3. Group related component rules together.
4. Keep naming consistent and readable.
5. Avoid duplication by extracting shared patterns.

### Term-definition pairs

| Pair | Definition |
|---|---|
| `.container` | Reusable layout wrapper class. |
| `.utility-*` | Utility naming pattern for focused helpers. |
| `@layer base` | Organizes foundational styles in cascade layers. |
| `@layer components` | Organizes component-level styles in layers. |

---

## Chapter 24: Final Project (8:56:56)

### What you learn

You combine everything from the course into a final responsive build with semantic HTML, utility classes, responsive media, and polished interaction states.

### Guided tutorial

1. Build semantic page structure and section layout.
2. Apply global utilities and component styles.
3. Add hero, navigation, and content sections.
4. Make images and cards responsive.
5. Add smooth scrolling and final responsive refinements.

### Term-definition pairs

| Pair | Definition |
|---|---|
| `name="viewport"` | Enables mobile-responsive viewport scaling. |
| `class="hero"` | Applies hero section styles. |
| `class="main"` | Applies main content area styles. |
| `scroll-behavior: smooth;` | Smoothly scrolls to anchor targets. |
| `min-height: 100vh;` | Ensures section fills viewport height. |
| `max-width: 800px;` | Limits content width for readability. |
| `padding: 1rem;` | Adds consistent internal spacing. |
