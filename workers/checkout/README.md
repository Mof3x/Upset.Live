# Checkout Worker

A small Cloudflare Worker that takes payments for the Shop and the Vault with Stripe, and keeps the stock count
in Directus right. The website is static (GitHub Pages), so it can't hold a Stripe secret key. This Worker holds
it instead.

## What it does

1. A visitor fills a basket and presses **Checkout**. The site sends `POST /checkout` with
   `{ items: [{ slug, quantity }] }` (up to 10 lines, up to 10 of each).
2. The Worker reads every item from Directus: each must be open to the public, **Available**, priced above zero and
   have enough **Inventory**. Prices always come from Directus, never from the browser.
3. It takes each line's quantity off **Inventory** (a "hold"). If one line can't be held, the others are given back
   (all or nothing). Then it creates one Stripe checkout for the basket that lasts 31 minutes.
4. The visitor pays on Stripe's page and comes back to `/order/complete`. Stripe emails the receipt.
5. If they don't pay, Stripe calls `POST /stripe-webhook` with `checkout.session.expired` and the Worker puts every
   line back, once each, even if Stripe sends the event twice.
6. If they come back to the basket, change it and check out again, the site first calls `POST /release` with the old
   checkout's id. The Worker asks Stripe to expire it (Stripe refuses for a paid checkout), and step 5 then returns the
   stock within seconds.

Two people can't buy the last unit: the stock change only applies if nobody changed it in between. If anything
breaks halfway, stock ends up too low (the site says "Sold out"), never too high.

What editors need to know is in the CMS guide (`Upset.live/CMS guide/For editors.md`).

## Files

| File | What it is |
|---|---|
| `src/index.js` | The Worker. Commented throughout. |
| `wrangler.toml` | Name, settings (`[vars]`) and the `EVENTS` storage. No secrets. |
| `.dev.vars.example` | Template for local secrets. Copy to `.dev.vars` (git-ignored). |
| `test/checkout.sim.mjs` | Offline simulation (fake Directus, Stripe and storage): `node workers/checkout/test/checkout.sim.mjs` from the repo root. Run it after any change. |

Secrets live in Cloudflare (`wrangler secret put`), never in this folder or the repo, which is public:

| Secret | Where it comes from |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys. Prefer a **restricted key** with *Checkout Sessions: Write* (if Stripe refuses to create a session with a permission error, also give it *Products* and *Prices: Write*). |
| `STRIPE_WEBHOOK_SECRET` | The signing secret (`whsec_…`) of the webhook endpoint you create in step 5. |
| `DIRECTUS_TOKEN` | The static token of the `checkout-worker` user in Directus (step 2). |

## One-time setup

Run these from this folder (`workers/checkout`). Use Stripe **test mode** first; switching to live is the last step.

1. **Stripe account.** Turn on email receipts for successful payments, and email notifications to yourself for each
   payment, so you know what to send out.
2. **Directus.** After the `shop-checkout-policy` script has run: in the Data Studio, create a user named
   `checkout-worker` (no password, no role), attach the **Checkout Worker** policy, generate a static token and copy
   it. Never paste it into chat or a file in the repo.
3. **Cloudflare login and storage.**
   ```bash
   npx wrangler login
   npx wrangler kv namespace create EVENTS
   ```
   Paste the printed `id` into `wrangler.toml` in place of `REPLACE_WITH_EVENTS_NAMESPACE_ID`.
4. **Secrets and first deploy.**
   ```bash
   npx wrangler secret put STRIPE_SECRET_KEY
   npx wrangler secret put DIRECTUS_TOKEN
   npx wrangler deploy
   ```
   Note the address it prints, e.g. `https://upset-checkout.<your-subdomain>.workers.dev`.
5. **Stripe webhook.** Stripe Dashboard → Developers → Webhooks → add an endpoint:
   - URL: `<worker address>/stripe-webhook`
   - Event: `checkout.session.expired`

   Copy its signing secret, then:
   ```bash
   npx wrangler secret put STRIPE_WEBHOOK_SECRET
   ```
6. **Website.** In GitHub → the repo → Settings → Secrets and variables → Actions → Variables, add
   `VITE_CHECKOUT_ENDPOINT` = the Worker address. The next deploy of `main` shows "Add to basket" on items that have a
   price and stock. Without this variable the site shows no basket at all.

## Settings (`wrangler.toml` → `[vars]`)

| Setting | Default | Meaning |
|---|---|---|
| `ALLOWED_ORIGINS` | `https://upset.live,http://localhost:5173` | Sites allowed to start a checkout. Stripe returns buyers to the same site. Add `https://www.upset.live` if the site is ever served there. |
| `CURRENCY` | `gbp` | Currency of every price. |
| `SHIPPING_COUNTRIES` | `GB` | Countries Stripe accepts delivery addresses for, e.g. `GB,IE`. |
| `DIGITAL_CATEGORIES` | `music-digital-releases` | Category slugs that need no delivery address. |
| `MAX_HOLDS_PER_IP` | `5` | Open checkouts one visitor may hold at once, so nobody can make the shop look sold out. |
| `SHIPPING_RATE_ID` | unset | A Stripe shipping rate (`shr_…`) added to physical orders. Unset means prices include postage. |

Change a setting, then run `npx wrangler deploy` again.

## Testing locally

The local Worker talks to the **live** Directus (there is only one), so use a test item with a price and stock.

1. Copy `.dev.vars.example` to `.dev.vars` and fill in a Stripe **test** key and the Directus token.
2. Start the Worker: `npx wrangler dev` (it listens on `http://localhost:8787`).
3. Forward Stripe's webhooks to it with the [Stripe CLI](https://docs.stripe.com/stripe-cli):
   `stripe listen --forward-to localhost:8787/stripe-webhook`. Put the `whsec_…` it prints into `.dev.vars` and
   restart `wrangler dev`.
4. In the site's `.env.local`, set `VITE_CHECKOUT_ENDPOINT=http://localhost:8787`, then `npm run dev`.
5. Add the test item to the basket and press Checkout: you land on Stripe's test checkout and the item's Inventory
   drops by the quantity.
   - Pay with Stripe's test card `4242 4242 4242 4242` (any future date, any CVC): you land on `/order/complete`.
   - Or expire the checkout instead (`stripe checkout sessions expire <cs_test_… id>`): Inventory goes back up.

## Going live

1. `npx wrangler secret put STRIPE_SECRET_KEY` with the **live** key.
2. Create the same webhook endpoint in Stripe's **live** mode and update `STRIPE_WEBHOOK_SECRET` with its secret.
3. Make one small real purchase and refund it from the Stripe Dashboard.

## When something looks wrong

- **An item says "Sold out" but you have stock.** Someone may be at checkout (it clears within ~31 minutes), or a
  hold wasn't released. Check the Stripe Dashboard for open or expired checkouts, then correct **Inventory** in
  Directus by hand.
- **Restocking.** Type the new total into **Inventory**. A unit held at that moment comes back on top if its
  checkout expires, so restock when nobody is mid-checkout, or subtract open holds.
- **Logs.** `npx wrangler tail` shows the Worker's errors live. They never include card details: Stripe handles
  those.
