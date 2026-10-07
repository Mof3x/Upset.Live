import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import VaultItemCard from "../components/cards/VaultItemCard";
import AddToBasket from "../components/basket/AddToBasket";
import EnquiryForm from "../components/forms/EnquiryForm";
import CardGrid from "../components/layout/CardGrid";
import { DetailHeader, PageIntro } from "../components/layout/PageIntro";
import PageState from "../components/layout/PageState";
import RelatedRail from "../components/rails/RelatedRail";
import CategoryNav from "../components/ui/CategoryNav";
import ContentState from "../components/ui/ContentState";
import MediaFrame from "../components/ui/MediaFrame";
import Prose from "../components/ui/Prose";
import { getOpenVaultItemBySlug, getOpenVaultItems, getVaultCategories } from "../lib/queries";
import { normalizeVaultItem } from "../lib/normalise";
import { gateStatus, usePageTitle } from "../lib/resourceState";
import useDirectusResource from "../lib/useDirectusResource";
import "./CorePages.css";
import { useBasket } from "../lib/basket";
import { checkoutEnabled, clearPendingCheckout } from "../lib/checkout";
import { contactEmail } from "../lib/forms";
import { recordPath } from "../lib/paths";

// Only open_public items that are not private are ever requested (see queries.js).
// The Shop is the public catalogue subset of the open Vault.
const SHOP_CATEGORY_SLUGS = [
  "prints",
  "publications",
  "posters",
  "apparel",
  "music-digital-releases",
  "guest-works",
];

const identity = (record) => record;

function nameFromSlug(slug) {
  const text = slug.replace(/-/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// The short availability line on an item page. `canBuy` is true when the item
// is buyable AND checkout is switched on (VITE_CHECKOUT_ENDPOINT is set).
function availabilityLabel(item, canBuy) {
  if (item.soldOut) return "Sold out";
  if (canBuy) return "Available";
  if (item.status === "available") return "Open for enquiries";
  if (item.status === "archived") return "Archived";
  return "";
}

// The sentence above the enquiry form, matched to whether the item can be bought.
function enquiryIntro(item, canBuy) {
  if (item.soldOut) {
    return "This has sold out. Ask us about future editions, or whether one may come back. We reply personally.";
  }
  if (canBuy) return "Want to know more before you buy? Ask about provenance, sizing or shipping. We reply personally.";
  return "Tell us what you would like to know about this edition: provenance, availability or shipping. We reply personally.";
}

function ItemGrid({ items, basePath }) {
  if (!items.length) return <ContentState status="empty" />;
  return (
    <CardGrid min="220px">
      {items.map((item) => (
        <VaultItemCard key={item.slug} {...item} basePath={basePath} />
      ))}
    </CardGrid>
  );
}

export function VaultPage() {
  usePageTitle("Vault");
  const [activeCategory, setActiveCategory] = useState("All");
  const items = useDirectusResource(getOpenVaultItems, [], normalizeVaultItem);
  const gate = gateStatus(items);

  if (gate !== "success") return <PageState status={gate} />;

  const categories = ["All", ...new Set(items.data.map((item) => item.category).filter(Boolean))];
  const visible =
    activeCategory === "All" ? items.data : items.data.filter((item) => item.category === activeCategory);

  return (
    <main className="core-page page-content">
      <PageIntro
        eyebrow="Archive / Vault"
        title="Vault"
        description="A slower room for original works, limited editions and archive objects."
      />
      <CategoryNav
        label="Filter the Vault by category"
        categories={categories}
        activeCategory={activeCategory}
        onChange={setActiveCategory}
      />
      <ItemGrid items={visible} basePath="/vault" />
    </main>
  );
}

function ShopListing({ categorySlug }) {
  const navigate = useNavigate();
  const items = useDirectusResource(getOpenVaultItems, [], normalizeVaultItem);
  const { data: categories } = useDirectusResource(getVaultCategories, [], identity);
  const shopCategories = categories.filter((category) => SHOP_CATEGORY_SLUGS.includes(category.slug));
  const active =
    shopCategories.find((category) => category.slug === categorySlug) ||
    (categorySlug ? { slug: categorySlug, name: nameFromSlug(categorySlug) } : null);
  usePageTitle(active ? `${active.name} · Shop` : "Shop");

  const gate = gateStatus(items);
  if (gate !== "success") return <PageState status={gate} />;

  const shopItems = items.data.filter((item) => SHOP_CATEGORY_SLUGS.includes(item.categorySlug));
  const visible = active ? shopItems.filter((item) => item.categorySlug === active.slug) : shopItems;
  const labels = ["All", ...new Set([...shopCategories.map((category) => category.name), ...(active ? [active.name] : [])])];

  return (
    <main className="core-page page-content">
      <PageIntro
        eyebrow={active ? "Shop" : "Editions"}
        title={active ? active.name : "Shop"}
        description="Prints, publications, posters, apparel and releases from the house. Each edition opens with its story first."
      />
      <CategoryNav
        label="Shop categories"
        categories={labels}
        activeCategory={active ? active.name : "All"}
        onChange={(label) => {
          const target = shopCategories.find((category) => category.name === label);
          navigate(target ? recordPath("/shop", target.slug) : "/shop");
        }}
      />
      <ItemGrid items={visible} basePath="/shop" />
    </main>
  );
}

export function ShopPage() {
  return <ShopListing />;
}

function VaultObject({ slug, basePath, sectionLabel }) {
  const itemResource = useDirectusResource(
    ({ signal }) => getOpenVaultItemBySlug(slug, { signal }),
    null,
    normalizeVaultItem,
    slug
  );
  const item = itemResource.data;
  usePageTitle(item?.title || sectionLabel);

  const gate = gateStatus(itemResource);
  if (gate !== "success") return <PageState status={gate} />;

  if (!item) {
    return <PageState status="notFound" actionTo={basePath} actionLabel={`Return to ${sectionLabel}`} />;
  }

  const [lead, ...rest] = item.gallery;
  // Show the Buy button only when the item can be sold (price + stock, see
  // normalizeVaultItem) and the checkout Worker is configured.
  const canBuy = item.buyable && checkoutEnabled;
  const availability = availabilityLabel(item, canBuy);
  // When buying isn't possible, the price (if any) goes in the header line instead.
  const headerPrice = !canBuy && !item.soldOut ? item.priceLabel : "";

  return (
    <main className="core-detail page-content">
      <DetailHeader eyebrow={sectionLabel} title={item.title} items={[item.category, item.edition, headerPrice]} />

      <section className="core-detail__grid">
        {lead ? (
          <MediaFrame ratio="4 / 5">
            <img src={lead.url} alt={lead.alt} />
          </MediaFrame>
        ) : (
          <div />
        )}

        <div className="core-detail__body">
          {item.artists.length > 0 && (
            <ul className="core-detail__credits" aria-label="Artists">
              {item.artists.map((artist) => (
                <li key={artist.slug}>
                  {artist.role ? `${artist.role}: ` : "By "}
                  <Link to={recordPath("/artists", artist.slug)}>{artist.name}</Link>
                </li>
              ))}
            </ul>
          )}
          <Prose className="core-detail__body" paragraphs={item.description} />
          {availability && <p className="core-notice">{availability}</p>}
          {/* The story comes first; the basket control sits under it. `section`
              is where the basket's link back to this item points. */}
          {canBuy && <AddToBasket item={item} section={basePath === "/vault" ? "vault" : "shop"} />}
        </div>
      </section>

      {rest.length > 0 && (
        <section className="core-section" aria-label="More images">
          <ul className="core-gallery">
            {rest.map((image, index) => (
              <li key={`${image.url}-${index}`}>
                <figure>
                  <MediaFrame ratio="4 / 5">
                    <img src={image.url} alt={image.alt} loading="lazy" />
                  </MediaFrame>
                  {image.caption && <figcaption>{image.caption}</figcaption>}
                </figure>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* The enquiry form stays on every open item, including buyable and sold-out ones. */}
      {item.status !== "archived" && (
        <section className="core-section" aria-labelledby="request-info">
          <h2 id="request-info">{canBuy ? "Questions" : "Request information"}</h2>
          <p className="core-notice">{enquiryIntro(item, canBuy)}</p>
          <EnquiryForm
            kind="vault-request"
            subject={`Vault enquiry: ${item.title}`}
            submitLabel={canBuy ? "Send question" : "Request information"}
            initialValues={{ message: `I would like to know more about "${item.title}".` }}
            fields={[
              { name: "name", label: "Name", required: true, autoComplete: "name" },
              { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
              { name: "message", label: "Message", type: "textarea", required: true, rows: 5 },
            ]}
          />
        </section>
      )}

      <RelatedRail
        groups={[
          {
            label: "Artists",
            items: item.artists.map((artist) => ({ to: recordPath("/artists", artist.slug), label: `Meet ${artist.name}` })),
          },
          { label: sectionLabel, items: [{ to: basePath, label: `Back to the ${sectionLabel.toLowerCase()}` }] },
        ]}
      />
    </main>
  );
}

export function VaultItemPage() {
  const { slug } = useParams();
  return <VaultObject slug={slug} basePath="/vault" sectionLabel="Vault" />;
}

// /order/complete: where Stripe sends a buyer after a successful payment (the
// success_url set by the checkout Worker). Stripe emails the receipt and the
// order is in the Stripe Dashboard, so this page says thank you and empties the
// basket. The session_id Stripe adds to the address isn't needed here.
// It lives under /order/ because /shop/:slug would read "complete" as an item.
export function OrderCompletePage() {
  usePageTitle("Thank you");
  const { clear } = useBasket();

  // The order is paid: empty the basket and forget the open checkout.
  useEffect(() => {
    clear();
    clearPendingCheckout();
  }, [clear]);

  return (
    <main className="core-page page-content">
      <PageIntro
        eyebrow="Order received"
        title="Thank you"
        description="Your payment went through. Stripe is emailing your receipt, and we will be in touch about delivery."
      />
      <p className="core-notice">
        Questions about your order? Write to {contactEmail} and include the name on your receipt.
      </p>
      <RelatedRail
        title="Keep exploring"
        groups={[
          {
            label: "Collections",
            items: [
              { to: "/shop", label: "Back to the Shop" },
              { to: "/vault", label: "Back to the Vault" },
            ],
          },
        ]}
      />
    </main>
  );
}

// /shop/:slug is either a shop category (e.g. /shop/prints) or a shop item.
export function ShopSlugPage() {
  const { slug } = useParams();

  if (SHOP_CATEGORY_SLUGS.includes(slug)) return <ShopListing key={slug} categorySlug={slug} />;
  return <VaultObject key={slug} slug={slug} basePath="/shop" sectionLabel="Shop" />;
}
