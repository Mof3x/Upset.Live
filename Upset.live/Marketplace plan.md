# Marketplace plan

*Written 17/11/2026, updated 17/11 (one basket, one Checkout button) and 18/11 (answers to the open questions; stage 1 done, stage 2 built).*

## What we're building

The Shop becomes the **Marketplace**: a shop of shops.

- Every artist can have **their own shop**, with a name they choose, paid into **their own Stripe account**.
- The collective keeps a **house shop** (UpsetXociety), paid into the collective's Stripe account as today.
- Products from every shop appear **together** on the Marketplace and around the site (homepage, artist pages,
  works), but each one belongs to its shop and is bought from that shop.
- Artists **add and manage their own products** in Directus.
- Later, artists can **style their shop** with the Directus visual editor.

## Decisions so far

| Question | Decision |
|---|---|
| Cost | **Free for the collective.** Stripe Connect with "Stripe handles pricing": no platform, account or payout fees (Stripe's UK Connect pricing page, checked 17/11/2026). Each artist pays only Stripe's normal card fee (1.5% + 20p on UK cards) on their own sales |
| Commission | None |
| Paying several artists | **One basket, one Checkout button.** A free Stripe payment can only go to one account, so a basket with several shops becomes one Stripe page per shop, opened **one after another** ("Payment 1 of 2"). No fees beyond the per-sale card fee |
| House items | Kept, paid to the collective exactly as now |
| Who edits products | Artists, their own; admins can edit everything |
| Addresses | `/marketplace` (everything), `/marketplace/prints` (a category), `/marketplace/<product>`, `/shops/<shop>`, and the same shop again at `/artists/<artist>/shop`. Old `/shop/...` links forward to `/marketplace/...` |
| API keys | **No artist ever enters a key.** They connect through Stripe's own sign-up page; Directus stores only their account id (`acct_…`) |
| New artists | **Get a draft shop automatically** (a Directus Flow), named after them; they open it when ready |
| Shop addresses | **Artists choose freely.** The slug must be unique and is cleaned to lowercase-with-dashes; `upsetxociety` is the house shop's |
| Postage | **Included in each price** for now |
| Artist products in the Vault | **Only when an editor or admin switches on "Show in Vault"** on the product. Artists can't change that switch. Every artist product is always in the Marketplace |

## How payment works

- **Direct charges.** A checkout for an artist's shop is created **on the artist's own Stripe account**. The money
  goes to them, Stripe takes its card fee from that sale, the receipt is in their name, and refunds and disputes are
  handled in their own Stripe dashboard. The collective never holds artists' money.
- **Stock holds stay exactly as now.** Checkout holds the stock, and an abandoned checkout gives it back.
- **Mixed baskets: one button, pages in a row.**
  1. The buyer presses the single **Checkout** button. The Worker holds the stock of **every** line at once (all or
     nothing), then creates one Stripe checkout per shop. Each is on that shop's account, or the collective's for
     the house shop.
  2. Stripe opens **"Payment 1 of N — *Shop*"**. After paying, Stripe sends the buyer back to the site, which opens
     the next payment by itself. With Stripe Link, later pages are a tap.
  3. After the last payment, **one thank-you page** lists everything bought, by shop. Each shop sends its own receipt.
  4. **Stopping partway:** paid lines leave the basket. The basket shows "*Shop* still to pay, held until 14:32"
     with a **Continue** button. Unpaid holds are released after about 30 minutes, as now.
- A basket can hold items from up to **5 shops** (the per-line limits stay: 10 lines, 10 of each).

## Data in Directus

A new **Shops** collection, separate from the artist profile. Artist profiles lock after the first save, and shop
details must stay editable.

| Field | Who sees it | Notes |
|---|---|---|
| Name, Slug | Public | The shop's name and web address (`/shops/<slug>`) |
| Artist | Public | The artist who runs it (one shop per artist). Empty for the house shop |
| Intro, Banner image | Public | Shown at the top of the shop page |
| Status | Public | Draft (hidden) / Open / Closed |
| Ready to sell | Public | Set **automatically** when Stripe confirms the account can take payments |
| Stripe account id | **Private** (admins and the checkout Worker) | `acct_…`, set by the Connect step |
| Connect link token | **Private** (the shop's artist and admins) | A random code inside the "Connect Stripe" link (see stage 3) |
| Look settings (later) | Public | Colours or layout choice for the visual editor |

On products (**Vault Items**):
- **Shop:** which shop sells it. Empty means the house shop.
- **Owner:** the person who created it, filled in automatically. Used for artist permissions.
- **Show in Vault:** on or off, changed only by editors and admins. The Vault lists open items with this switched
  on. Existing items are switched on when it's added, so today's Vault stays exactly as it is.

## The four stages

Each stage can go live on its own. The house shop keeps selling throughout.

### Stage 1: Shop becomes Marketplace (website only)

- **Navigation:** rename the header tab, homepage door, footer links and page titles.
- **Addresses:** add `/marketplace`, `/marketplace/<category or product>` and `/basket`. Old `/shop` and
  `/shop/<x>` addresses forward to the new ones, so shared links and Stripe's return pages keep working.
- **Directus and Worker:** no change.

### Stage 2: Shops

- **Directus, in reviewed scripts:**
  - create the **Shops** collection, the Shop and Show in Vault fields on products (Show in Vault switched on for
    existing items), plus a house-shop record (`upsetxociety`);
  - let visitors read open shops (never the Stripe fields);
  - let the checkout Worker read shops.
- **Website:**
  - the Vault page lists only items with Show in Vault switched on; the Marketplace lists every open item;
  - shop pages at `/shops/<shop>` and `/artists/<artist>/shop`, with name, intro, banner and products;
  - a "Visit *Shop*" link on artist pages;
  - "from *Shop*" on product cards;
  - Marketplace filters by category and by shop;
  - one basket for everything; each line says which shop it's from.
- **Worker: no change in this stage** (changed 18/11 while building). Artist products stay **enquiry-only**
  until stage 3, so every payment still goes to the house shop. The Worker's Directus policy is narrowed so it can
  only see house products. The one-after-another Stripe pages (`/order/next`, remembering what's paid) move to
  stage 3: they only matter once a second shop can take money, and they can then be tested end to end with a test
  connected account.
- **Built 18/11/2026** (branch `marketplace`): the website parts above, and `mk2-shops.ps1` in the
  `UpsetXociety-ops` folder (Manifest, Execute, Verify, Undo; offline simulation 43/43). Order: run the script,
  then deploy the site.

### Stage 3: Artists connect Stripe

- **You, once:**
  - turn on **Connect** in the collective's Stripe account and choose "Stripe handles pricing", with connected
    accounts getting the full Stripe Dashboard;
  - fill in the platform profile;
  - give the Worker a new restricted key with *Checkout Sessions*, *Accounts* and *Account Links* (all Write);
  - add a second webhook for **connected accounts**.
- **The artist:** on their shop in Directus they click **Connect Stripe**. That opens a Worker address, which:
  - checks the link's token;
  - creates their Stripe account, or continues the one already started;
  - sends them to Stripe's sign-up, where they enter ID and bank details with Stripe.

  When Stripe confirms the account can take payments, the Worker ticks **Ready to sell** by itself.
- **Safety:**
  - Once a shop has a Stripe account, the link can only continue *that* account, never swap in another. Changing
    the account needs an admin. This stops a leaked link from redirecting an artist's payouts.
  - The token is visible only to that artist and admins.
- **Checkout:** one Checkout holds every line, then returns one Stripe page per shop, in order (moved here from
  stage 2). The site walks the buyer through them (`/order/next`), and the basket remembers what's paid. Each artist
  shop's page is created on that artist's account (direct charge), with the same stock holds. Abandoned checkouts are released through the connected-account webhook.
- **Directus:** the Worker may set the Stripe account id and Ready to sell on shops, and nothing else new.

### Stage 4: Artists manage their own shop

- **What the Artist role gets:**
  - edit their own shop's name, intro and banner;
  - create, edit and remove their own products: title, photo, description, category, price, stock, edition,
    status;
  - upload photos, which they can already do.
- **What it doesn't get:**
  - Classification is fixed to Open for artist products; Closed is the collective's archive.
  - **Show in Vault** stays with editors and admins.
  - Artists can't see or change other shops, the Stripe fields, or other artists' products.
- **Automatic steps (Directus Flows):**
  - a new product gets the artist's shop and an artist credit;
  - a new artist gets a **draft shop** automatically, named after them, with a unique address they can change;
  - a shop's address is cleaned to lowercase-with-dashes when saved, and refused if another shop has it.
- **Testing:** a mock Artist account goes through each step, as with the earlier Artist tests.

### Later: shop styling

- Shop pages become editable in the Directus **visual editor**: name, intro, banner and a few look settings.
- These are limited choices, such as colour themes and layouts, so every shop still fits the site.
- This needs the visual editor branch merged first.

## How each stage is checked

- **Worker:**
  - extend the offline simulation (`workers/checkout/test/checkout.sim.mjs`) with shops and connected accounts:
    a mixed basket held all-or-nothing and split into one page per shop, a not-ready shop refused, each page on the
    right account, partial payment then abandonment releasing only the unpaid shops, and a leaked link that can't
    swap the account;
  - after deploying, the same harmless live checks as before.
- **Directus:** every change is a script that reads first, shows a manifest and its hash, writes only on your
  approval, and verifies itself. Each has an offline simulation and an Undo.
- **Website:** `npm run lint`, `npm run build`, and browser checks of every page and basket case.
- **Stripe:** a full test-mode purchase from a test connected account before any live use.

## Before starting: a permanent home for scripts

Windows temp cleanup (around 15–20 October) deleted every Directus script package from my temporary folders: shop
checkout, public site, music and artist set-up, with their run records. Live Directus is unaffected, but those Undo
steps and records are gone.

From now on, packages and run records live in **`C:\Users\shirl\Apps\UpsetXociety-ops\`**: outside the public
repo, and not a temp folder. The first script there is a **read-only snapshot** of the current roles, rules and
fields. Much has changed since the last full picture, and every new script needs that baseline.

## Answered questions (18/11/2026)

All four are in the decisions table above: automatic draft shops, freely chosen shop addresses, postage included in
prices, and "Show in Vault" set by editors and admins.
