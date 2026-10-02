import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import VaultItemCard from "../components/cards/VaultItemCard";
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

function availabilityLabel(status) {
  if (status === "available") return "Open for enquiries";
  if (status === "archived") return "Archived";
  return "";
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

  return (
    <main className="core-detail page-content">
      <DetailHeader eyebrow={sectionLabel} title={item.title} items={[item.category, item.edition]} />

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
          {availabilityLabel(item.status) && <p className="core-notice">{availabilityLabel(item.status)}</p>}
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

      {item.status !== "archived" && (
        <section className="core-section" aria-labelledby="request-info">
          <h2 id="request-info">Request information</h2>
          <p className="core-notice">
            Tell us what you would like to know about this edition: provenance, availability or
            shipping. We reply personally.
          </p>
          <EnquiryForm
            kind="vault-request"
            subject={`Vault enquiry: ${item.title}`}
            submitLabel="Request information"
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

// /shop/:slug is either a shop category (e.g. /shop/prints) or a shop item.
export function ShopSlugPage() {
  const { slug } = useParams();

  if (SHOP_CATEGORY_SLUGS.includes(slug)) return <ShopListing key={slug} categorySlug={slug} />;
  return <VaultObject key={slug} slug={slug} basePath="/shop" sectionLabel="Shop" />;
}
