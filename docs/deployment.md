# Deployment and operations

## How the live site is put together

```text
visitor ──► upset.live (DNS on Cloudflare) ──► GitHub Pages: built static files from dist/
   │
   ├──── browser JavaScript ──► cms.upset.live (Directus on Heroku) ──► Supabase Postgres + Storage
   │
   └──── Checkout ──► checkout Worker (Cloudflare) ──► Stripe Checkout
                       │   ▲
                       │   └── Stripe webhook (checkout expired)
                       └────► cms.upset.live (reads price and stock, holds one unit)
```

- **GitHub Pages** serves the built app. The Pages source must be set to **GitHub Actions** (not "Deploy from a
  branch", which serves the raw source files and shows a blank page). The custom domain is `upset.live`.
- **Directus** answers the browser's API and image requests. It must send CORS headers for `https://upset.live`.
- **Accounts.** Keep a private record (not in this repo) of who holds the admin login for each service: GitHub,
  Cloudflare, Heroku, Supabase, the domain registrar and the `hello@upset.live` mailbox. Every service should have at
  least two people who can get in.

## Deploying

Every push to `main` deploys. `.github/workflows/deploy-pages.yml`:

1. checks out the repo and installs dependencies with `npm ci` (Node 22);
2. fails early if the repository variable `VITE_DIRECTUS_URL` is missing;
3. runs `npm run build`;
4. copies `dist/index.html` to `dist/404.html`;
5. uploads `dist/` and deploys it to Pages.

You can also run it by hand from the Actions tab (**Deploy site → Run workflow**).

Step 4 is the single-page-app fallback. GitHub Pages has no rewrite rules, so a deep link such as `/works/some-slug`
would be a 404. Serving `index.html` as the 404 page lets the app load and route it. Pages still sends HTTP status 404
for those URLs, and browsers log it in the console. That's expected and doesn't affect visitors.

Work on a branch and merge to `main` when it's ready to go live. See [Contributing](contributing.md#branches-and-releases).

## Environment variables

Vite puts every `VITE_*` variable into the JavaScript bundle, where anyone can read it. **Never put a token, password,
database URL or service key in one.**

| Variable | Used for | Where it's set |
|---|---|---|
| `VITE_DIRECTUS_URL` | Directus origin, e.g. `https://cms.upset.live` (no trailing slash) | `.env.local` for development; repository **variable** (Settings → Secrets and variables → Actions → Variables) for the deploy |
| `VITE_DIRECTUS_DEV_PROXY` | `false` makes `npm run dev` call Directus directly instead of through `/cms` | `.env.local`, optional |
| `VITE_FORMS_ENDPOINT` | Server endpoint that receives form submissions at `<endpoint>/<kind>`. When unset, forms open a pre-filled email | Not set yet. To use it in production, add it to the workflow's `env:` and as a repository variable |
| `VITE_CONTACT_EMAIL` | Address for the email fallback (default `hello@upset.live`) | Optional |
| `VITE_CHECKOUT_ENDPOINT` | The checkout Worker's address. When unset, the site shows no Buy buttons | `.env.local` (`http://localhost:8787` with `wrangler dev`); repository **variable** for the deploy (the workflow already passes it) |

The checkout Worker's own secrets (Stripe keys, its Directus token) live in Cloudflare, never in this repo or a
`VITE_*` variable. See [Checkout](#checkout).

Directus's own settings (CORS, storage, mail and so on) are Heroku config vars on the Directus app, not variables of
this repo.

## CORS

The browser on `upset.live` reads `cms.upset.live`, a different origin, so Directus must allow it. These Heroku config
vars are set on the Directus app:

```text
CORS_ENABLED=true
CORS_ORIGIN=https://upset.live
```

Directus sends the header on `/assets` too. The glow and dither image effects depend on that.

If you add another origin (a `www.` domain, a preview domain), add it to `CORS_ORIGIN`. Otherwise the site on that
origin can't load content, and its canvas effects fall back to plain images.

Local development doesn't need CORS, because of the `/cms` proxy.

## Forms

Until `VITE_FORMS_ENDPOINT` exists, contact, commission, newsletter and Vault request forms hand the visitor a
pre-filled email to `hello@upset.live`. Someone has to watch that mailbox.

The planned endpoint, for example a Cloudflare Worker, should:

1. accept `POST <endpoint>/<kind>` with JSON, for kinds `contact`, `commission`, `newsletter`, `vault-request`;
2. validate the body, reject unknown fields, and rate-limit;
3. write only that one record to Directus (`contact_messages`, `commission_requests`, `newsletter_signups`) with its
   own server-side token, stored as a secret on the endpoint host;
4. return a generic success response, never the stored record.

The Public role must never get create access to those collections.

## Checkout

Payments run through a Cloudflare Worker in `workers/checkout` and Stripe's hosted checkout page. Its
[README](../workers/checkout/README.md) has the setup commands, settings and local testing steps.

- **What it needs.** A Stripe account (live mode activated, receipts on), the Worker deployed with three secrets
  (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DIRECTUS_TOKEN`), a Stripe webhook for `checkout.session.expired`
  pointing at `<worker>/stripe-webhook`, and the repository variable `VITE_CHECKOUT_ENDPOINT`.
- **Directus.** The Public role must read `price` and `inventory` on open items, and the Worker's token comes from a
  `checkout-worker` user holding only the **Checkout Worker** policy (read open items; update `inventory` only). See
  [Directus](directus.md).
- **Stock.** Starting a checkout takes each basket line's quantity off `inventory` (all lines or none); an abandoned
  checkout puts it back after about 31 minutes, or within seconds if the buyer changes their basket and checks out
  again (the site asks the Worker to cancel the old checkout). The update only applies if nobody changed the stock in between, so two buyers can't take the last unit. If
  something fails halfway, stock ends up too low (the site says "Sold out"), never too high.
- **Orders** are in the Stripe Dashboard, with the delivery address. Refunds are made there too. A refund doesn't put
  the unit back: change `inventory` in Directus by hand if the item returns to stock.
- **Basket limits:** 10 different items, 10 of each, per checkout.
- **Not built yet:** automatic order records in Directus.

## Troubleshooting the live site

| Symptom | Likely cause | Check |
|---|---|---|
| Blank page at upset.live | Pages source set to "branch", or a failed deploy | Settings → Pages shows "GitHub Actions"; latest run in the Actions tab is green |
| "Site not found" (GitHub 404 page) | Custom domain or DNS not set | Settings → Pages → Custom domain; DNS records at Cloudflare |
| Deploy fails at "Require public Directus URL" | Repository variable missing | Settings → Secrets and variables → Actions → Variables has `VITE_DIRECTUS_URL` |
| Every section says "The archive is unavailable" | Directus down or CORS broken | Open `https://cms.upset.live/server/ping` (should say `pong`); in the browser console look for CORS errors; check the Heroku app and `CORS_ORIGIN` |
| A section says "This room is not open yet" | The Public role can't read that collection | Expected for Razz and Vault until they're opened (see [Directus](directus.md#what-the-public-can-read)) |
| "Nothing has been published here yet" | The collection is readable but nothing is published | Publish a record in Directus |
| A published record is missing | Its `is_published` is off, or it's linked to an unpublished record | Check the record and what it links to in Directus |
| A credit or related link is missing | No junction row, or the other side is unpublished | Check `work_artists`/`text_authors`/`text_related_works` |
| An image doesn't show | No image set, the file isn't attached to a published record, or a storage error | Open the `/assets/<id>` URL directly while logged out |
| Images show but without the glow/dither effect | CORS header missing for that origin | `CORS_ORIGIN` includes the site's origin |
| A link to a record 404s | Unusual slug and a link built without `recordPath` | Fix the link in code, and give the record a clean slug in Directus |
| No "Add to basket" on an item | No price, no stock, status not Available, or the site built without `VITE_CHECKOUT_ENDPOINT` | The item in Directus; the repository variable; redeploy after setting it |
| "Checkout couldn't start" | Worker down, a missing Worker secret, or the Directus token refused | `npx wrangler tail` in `workers/checkout`; the Worker's secrets; the checkout-worker user and its policy |
| An item says "Sold out" but there's stock | Someone is at checkout (clears within ~31 minutes), or a hold wasn't released | The Stripe Dashboard for open or expired checkouts; then correct `inventory` in Directus |

## Costs and renewals

Keep a private list of what the site costs and when each item renews: the domain, Heroku dynos and add-ons, the
Supabase plan, and any paid Cloudflare or email features. Funders often ask for these running costs, and a lapsed
domain or card takes the whole site down.
