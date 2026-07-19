Here’s a compact CSS **selector menu** you can keep as a reminder. It’s grouped by purpose with tiny examples.

**Basics**
- `*` — universal selector  
  `* { box-sizing: border-box; }`
- `tag` — element  
  `p { line-height: 1.6; }`
- `.class` — class  
  `.card { padding: 16px; }`
- `#id` — id  
  `#root { width: 100%; }`

**Combinators (relationships)**
- `A B` — descendant  
  `.nav a { color: white; }`
- `A > B` — direct child  
  `.nav > a { margin-right: 8px; }`
- `A + B` — next sibling  
  `h2 + p { margin-top: 0; }`
- `A ~ B` — following siblings  
  `h2 ~ p { color: #666; }`

**Attributes**
- `[attr]` — has attribute  
  `input[disabled] { opacity: 0.5; }`
- `[attr="value"]` — exact match  
  `input[type="email"] { border: 1px solid; }`
- `[attr^="val"]` — starts with  
  `a[href^="https"] { color: green; }`
- `[attr$="val"]` — ends with  
  `a[href$=".pdf"] { text-decoration: underline; }`
- `[attr*="val"]` — contains  
  `img[alt*="logo"] { height: 40px; }`

**Pseudo‑classes (state)**
- `:hover`, `:focus`, `:active`  
  `button:hover { transform: translateY(-1px); }`
- `:checked`, `:disabled`, `:required`  
  `input:checked + label { font-weight: 700; }`
- `:first-child`, `:last-child`, `:nth-child(n)`  
  `li:nth-child(odd) { background: #f5f5f5; }`
- `:not(selector)`  
  `button:not(.primary) { opacity: 0.8; }`

**Pseudo‑elements (parts)**
- `::before`, `::after`  
  `.tag::before { content: "#"; }`
- `::first-line`, `::first-letter`  
  `p::first-letter { font-size: 2em; }`
- `::selection`  
  `::selection { background: yellow; }`

**Grouping**
- `A, B, C`  
  `h1, h2, h3 { font-family: serif; }`

If you want, I can tailor this to your current project (e.g., selectors for `canvas`, your header, or specific layout patterns).

An **id** is a unique name for a single element in your HTML. You use it when you want to target **one specific element**.

- In HTML/JSX: `id="hero"`
- In CSS: `#hero { ... }`
- In JS: `document.getElementById("hero")`

Example:

```html
<section id="hero">...</section>
```

```css
#hero {
  padding: 40px;
}
```

**Rules of thumb:**
- An `id` should be **unique** on the page (only one element with that id).
- Use a **class** when you want to style **many** elements the same way.
- Use an **id** for one‑off layout or targeting (anchors, JS hooks).

**Child vs sibling combinators (CSS)**

- **Child combinator (`A > B`)**: selects **direct children** of `A` only.  
  Example: `.card > p` matches `<p>` that is **immediately inside** `.card`, not nested deeper.

- **Adjacent sibling (`A + B`)**: selects the **very next** sibling after `A`.  
  Example: `h2 + p` matches the **first** `<p>` right after an `<h2>`.

- **General sibling (`A ~ B`)**: selects **all following** siblings after `A`.  
  Example: `h2 ~ p` matches **all** `<p>` elements that come after the `<h2>` (same parent).

So: **child = inside**, **sibling = beside** (same parent).