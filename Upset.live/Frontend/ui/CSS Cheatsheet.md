
---
tags:
- webdev
- css
- cheatsheet
- reference
---

# CSS Cheatsheet (Beginner-ish Refresher)

## 1) The basic shape of CSS
```css
selector {
  property: value;
  property: value;
}
```


CSS can target **elements**, **classes/IDs/attributes**, and **relationships** between elements in the HTML tree. Here’s the cheat list.

###  Elements (type selectors)
These are literally the HTML tags:
```css
p { }
div { }
h1 { }
ul { }
li { }
a { }
button { }
img { }
section { }
header { }
main { }
footer { }
input { }
```
Meaning: “select every `<p>`” etc.

### Classes, IDs, attributes
### Class
```css
.card { }
```
Matches: `<div class="card">`

### ID
```css
#site-header { }
```
Matches: `<header id="site-header">`  
(IDs should be unique per page.)

### Attribute selectors (super useful)
```css
[type="email"] { }        /* <input type="email"> */
a[href] { }               /* any link with an href */
a[href^="https"] { }      /* starts with */
a[href$=".pdf"] { }       /* ends with */
a[href*="example"] { }    /* contains */
```

### Combining selectors on the same element
### Element + class
```css
button.primary { }
```
Matches: `<button class="primary">`

### Multiple classes (AND)
```css
.card.featured { }
```
Matches: `<div class="card featured">` (has both)

### Grouping (OR)
```css
h1, h2, h3 { }
```
Matches any of those.

###  Relationships (combinators)
These describe how elements relate in the DOM.

### Descendant (space): “inside anywhere”
```css
nav a { }
```
Matches `<a>` anywhere inside `<nav>` (child, grandchild, etc.)

### Child (`>`): “directly inside”
```css
nav > a { }
```
Matches `<a>` that is a *direct child* of `<nav>` only.

### Adjacent sibling (`+`): “immediately after”
```css
h2 + p { }
```
Matches the first `<p>` that comes right after an `<h2>`.

### General sibling (`~`): “after (anywhere later), same parent”
```css
h2 ~ p { }
```
Matches every `<p>` after an `<h2>` that shares the same parent.

### Column (`||`) (rare)
For styling table columns when using `<col>`/`<colgroup>`:
```css
col.selected || td { }
```
Not commonly used day-to-day.

### “Relationship-ish” extras (pseudo-classes)
These aren’t tree combinators, but they select based on position/state.

### State
```css
a:hover { }
button:focus { }
input:checked { }
button:disabled { }
```

### Structure / position
```css
li:first-child { }
li:last-child { }
li:nth-child(2) { }
li:nth-child(odd) { }
li:nth-child(3n) { }      /* 3,6,9... */
```

### Type-based position (ignores other element types)
```css
p:first-of-type { }
p:nth-of-type(2) { }
```

### Negation
```css
button:not(.primary) { }
```

### Pseudo-elements (parts of an element)
```css
p::first-line { }
p::first-letter { }
::selection { }
.button::before { content: ""; }
.button::after { content: ""; }
```

### The modern “has” selector (parent-ish)
Select an element *if it contains something*:
```css
.card:has(img) { }
```
Support is good in modern browsers, but it’s newer than the basics.

---

### Tiny HTML example showing relationships
```html
<nav class="menu">
  <a class="item" href="/">Home</a>
  <div class="group">
    <a class="item" href="/about">About</a>
  </div>
</nav>
```

```css
nav a { }        /* both links (descendant) */
nav > a { }      /* only "Home" (direct child) */
.menu .item { }  /* both links (class + descendant) */
a.item { }       /* both links (element + class) */
```

If you want, paste a small chunk of your HTML and I’ll list exactly what selectors/relationships make sense for it (and which ones to avoid for specificity reasons).
### Ways to target things (selectors)
```css
p { }                 /* element */
.note { }             /* class */
#header { }           /* id */
a:hover { }           /* pseudo-class */
p::first-line { }     /* pseudo-element */

.container p { }      /* descendant */
nav > a { }           /* direct child */
h1, h2 { }            /* group */
button.primary { }    /* element + class */
```

## 2) How CSS “wins” (cascade + specificity)
- Later rules can override earlier rules (if specificity ties)
- More specific selectors override less specific ones  
  Rough order (low → high):
  - element `p`
  - class `.card`, pseudo-class `:hover`
  - id `#main`
  - inline style `style=""` (usually avoid)
- `!important` overrides most things (use rarely)

## 3) Common units
- `px` fixed-ish
- `%` relative to parent (varies by property)
- `em` relative to current font-size
- `rem` relative to root font-size (often easiest)
- `vw`, `vh` relative to viewport width/height

## 4) Colors
```css
color: #222;
background: #f5f5f5;
border-color: rgb(255, 0, 0);
color: hsl(210 50% 40%);
opacity: 0.8; /* affects the whole element */
```

## 5) Text / fonts
```css
font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
font-size: 16px;      /* often use rem */
font-weight: 400;     /* 400 normal, 700 bold */
line-height: 1.5;     /* unitless is common */
letter-spacing: 0.02em;

text-align: left;     /* left | center | right */
text-decoration: none;/* remove link underline */
text-transform: uppercase;
```

## 6) The box model (most important refresher)
- Content → Padding → Border → Margin

```css
.box {
  width: 300px;
  padding: 16px;
  border: 2px solid #ccc;
  margin: 24px;
}
```

### Use this constantly:
```css
* { box-sizing: border-box; }
```
- Makes `width` include padding + border (less surprise math)

## 7) Display basics
```css
display: block;        /* takes full line */
display: inline;       /* flows in text, width/height mostly ignored */
display: inline-block; /* inline but can size */
display: none;         /* removed from layout */
```

## 8) Sizing + spacing patterns
```css
width: 100%;
max-width: 800px;
min-height: 100vh;

margin: 0 auto;  /* center a fixed/max-width block */
padding: 12px 16px; /* top/bottom left/right */
```

## 9) Borders, rounded corners, shadows
```css
border: 1px solid #ddd;
border-radius: 12px;

box-shadow: 0 8px 24px rgba(0,0,0,0.12);
```

## 10) Backgrounds
```css
background-color: #111;
background-image: url("/img/hero.jpg");
background-size: cover;      /* contain | cover */
background-position: center; /* x y */
background-repeat: no-repeat;
```

## 11) Positioning (when you need it)
```css
.parent { position: relative; }

.badge {
  position: absolute;
  top: 8px;
  right: 8px;
}
```

Other values:
- `relative`: stays in flow, can nudge with `top/left`
- `absolute`: removed from flow, positioned inside nearest positioned ancestor
- `fixed`: pinned to viewport
- `sticky`: acts normal until it “sticks” (`top: 0` etc.)

## 12) Flexbox (go-to layout tool)
Use flex when you want 1D layout (row OR column).

```css
.row {
  display: flex;
  gap: 12px;
  justify-content: space-between; /* main axis */
  align-items: center;            /* cross axis */
}
```

Common patterns:
```css
/* center perfectly */
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* make one item grow */
.item-grow { flex: 1; } /* or: flex: 1 1 auto; */
```

Flex direction:
```css
flex-direction: row;    /* default */
flex-direction: column;
flex-wrap: wrap;
```

## 13) CSS Grid (2D layouts)
```css
.grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, 1fr);
}
```

Responsive columns:
```css
.grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}
```

## 14) Responsive design essentials
### Media queries
```css
@media (max-width: 768px) {
  .sidebar { display: none; }
}
```

### Fluid-ish typography (simple)
```css
h1 { font-size: clamp(1.5rem, 3vw, 2.5rem); }
```

## 15) Links, buttons, forms (quick defaults)
```css
a { color: #2563eb; }
a:hover { text-decoration: underline; }

button {
  padding: 10px 14px;
  border: 0;
  border-radius: 10px;
  background: #111;
  color: white;
}
button:hover { filter: brightness(1.1); }
button:disabled { opacity: 0.5; cursor: not-allowed; }

input, textarea, select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 10px;
}
```

## 16) The “why isn’t my CSS working?” checklist
- Did you target the right selector?
- Is another rule overriding it? (check DevTools “Styles”)
- Specificity conflict? Try simplifying or making selector slightly more specific
- Are you styling the right state? (e.g., `:hover`, `:focus`)
- Is the element inline? (inline ignores width/height)
- Did you forget `display: flex` / `display: grid`?
- Margin collapsing / parent has no padding/border (common with top margins)

## 17) Super-useful starter snippet (drop into most sites)
```css
* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  line-height: 1.5;
  color: #111;
}

img {
  max-width: 100%;
  display: block;
}
```

---

If you tell me what you’re styling (blog, landing page, portfolio, etc.), I can add a mini “common layouts” section (navbar, card grid, centered hero, sidebar).