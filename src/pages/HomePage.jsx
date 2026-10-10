// import { Link } from "react-router-dom";
// import GlowCanvas from "../components/atmosphere/glowcanvas";
// import DitherCanvas from "../components/atmosphere/dithercanvas";

// import { BrowserRouter } from "react-router-dom";
// import "./HomePage.css";

// export default function HomePage() {
//   return (
//     <>
//      <article className="hero">
//       <header>
//          <h1>UpsetXociety</h1>
//            <p>Art House</p>
//       </header>
//       <div className="hero-image">
//          <GlowCanvas id="hero-canvas" src="/gor.jpeg" />
//       </div>
//      </article>
//      <div className="page-content">
//        <main className="HomePage">

            
//       <quote className="quote-section">
//          <p>"Blackness is lit, don't let anyboy tell you it's not, at the end of the day, we're all black - unless you're not, sucks to suck." - Silvia Wynter</p>
//       </quote>

//       <div className="bottom-grid">
//        <section className="showcase-section">

//       <article className="Featured">
//         <h2>Featured Work</h2>
//         <DitherCanvas id="featured-canvas" src="/gor.jpeg" />  
//         <div className="featured-info">                           
//           <h3>Title: Upset</h3>
//           <div className="art-info">
//              <div className="art-copy">
//                 <p>Men and women of the Congo, Victorious independence fighters, I salute you in the name of the Congolese Government.</p>  
//                 <p>I ask all of you, my friends, who tirelessly fought in our ranks, to mark this June 30, 1960, as an illustrious date that will be ever engraved in your hearts, a date whose meaning you will proudly explain to your children, so that they in turn might relate to their grandchildren and great-grandchildren the glorious history of our struggle for freedom.</p>  
//                 <p>Although this independence of the Congo is being proclaimed today by agreement with Belgium, an amicable country, with which we are on equal terms, no Congolese will ever forget that independence was won in struggle, a persevering and inspired struggle carried on from day to day, a struggle, in which we were undaunted by privation or suffering and stinted neither strength nor blood.</p> 
//                 <h3>Featured Artist: Upset</h3>
//                 <p>It was filled with tears, fire and blood. We are deeply proud of our struggle, because it was just and noble and indispensable in putting an end to the humiliating bondage forced upon us.</p>  
//                 <p>That was our lot for the eighty years of colonial rule and our wounds are too fresh and much too painful to be forgotten.</p>  
//                 <p>We have experienced forced labour in exchange for pay that did not allow us to satisfy our hunger, to clothe ourselves, to have decent lodgings or to bring up our children as dearly loved ones.</p>  
//                 <p>Morning, noon and night we were subjected to jeers, insults and blows because we were "Negroes". Who will ever forget that the black was addressed as "tu", not because he was a friend, but because the polite "vous" was reserved for the white man?</p>  
//                 <p>We have seen our lands seized in the name of ostensibly just laws, which gave recognition only to the right of might.</p>  
//              </div>
//              <a href="/full-article" class="read-more">...read more</a>
//            </div>
//            <GlowCanvas id="featured-artist" src="/gor.jpeg" />
//          </div>
//          </article>

//          <article className="related-works">
//            <h2>Related Works</h2>
//            <div className="related-works-grid">
//              <GlowCanvas className="related-work" src="/gor.jpeg" />
//              <GlowCanvas className="related-work" src="/gor.jpeg" />
//              <GlowCanvas className="related-work" src="/gor.jpeg" />
//              <GlowCanvas className="related-work" src="/gor.jpeg" />
//            </div>
//          </article>

//          <article className="newsletter-form">
//             <h2>Stay connected</h2>
//                <form>
//                  <input id="email" autoComplete="email" type="email" placeholder="Enter your email" />
//                  <button type="submit">Subscribe</button>
//                </form>
//           </article>

//           </section>
//           </div>
//         </main>
//       </div>
//      </>
//     )
// }

import { useState } from "react";
import { Link } from "react-router-dom";
import GlowCanvas from "../components/atmosphere/glowcanvas";
import DitherCanvas from "../components/atmosphere/dithercanvas";
import ContentState from "../components/ui/ContentState";
import { isForbiddenError } from "../lib/directus";
import { submitForm, validateEnquiry } from "../lib/forms";
import { usePageTitle } from "../lib/resourceState";
import {
  getOpenVaultItems,
  getPublishedArtists,
  getPublishedJournalEntries,
  getPublishedTexts,
  getPublishedWorks,
} from "../lib/queries";
import {
  normalizeArtist,
  normalizeJournalEntry,
  normalizeText,
  normalizeVaultItem,
  normalizeWork,
} from "../lib/normalise";
import useDirectusResource from "../lib/useDirectusResource";
import { SHOP_CATEGORY_SLUGS } from "../lib/shop";
import "./HomePage.css";
import "./HomePortal.css";
import { recordPath } from "../lib/paths";

function HeroCard({ hero }) {
  return (
    <article className="home-card hero-card">
      <Link className="hero-card__link" to={hero.href}>
        <div className="hero-card__content">
          <p className="eyebrow">{hero.subtitle}</p>
          <h1>{hero.title}</h1>
          <span className="text-link">{hero.ctaLabel}</span>
        </div>

        <div className="hero-card__media">
          <GlowCanvas
            id="hero-canvas"
            src={hero.image}
            alt={hero.imageAlt}
          />
        </div>
      </Link>
    </article>
  );
}

function QuoteCard({ quote }) {
  return (
    <article className="home-card quote-card">
      <blockquote>
        <p>“{quote.text}”</p>
        <footer>— {quote.attribution}</footer>
      </blockquote>
    </article>
  );
}

function ArtistCard({ artist }) {
  return (
    <article className="artist-card">
      {artist.image && (
        <GlowCanvas
          id="featured-artist"
          className="artist-card__image"
          src={artist.image}
          alt={artist.imageAlt}
        />
      )}

      <div className="artist-card__content">
        <p className="eyebrow">Featured artist</p>
        <h3>{artist.name}</h3>
        {artist.excerpt && <p>{artist.excerpt}</p>}
        <Link className="text-link" to={recordPath("/artists", artist.slug)}>
          Meet the artist
        </Link>
      </div>
    </article>
  );
}

function WorkCard({ work }) {
  return (
    <article className="work-card">
      <Link to={work.href} className="work-card__link">
        <GlowCanvas
          className="work-card__image"
          src={work.image}
          alt={work.imageAlt}
        />

        <div className="work-card__content">
          <p className="eyebrow">{work.type}</p>
          <h3>{work.title}</h3>
          <span className="text-link">Explore</span>
        </div>
      </Link>
    </article>
  );
}

function NewsletterCard({ newsletter }) {
  const [state, setState] = useState({ status: "idle", message: "" });

  async function handleSubmit(event) {
    event.preventDefault();
    if (state.status === "sending") return;

    const email = new FormData(event.currentTarget).get("email");
    const errors = validateEnquiry({ email }, ["email"]);
    if (errors.email) {
      setState({ status: "invalid", message: errors.email });
      return;
    }

    setState({ status: "sending", message: "" });
    try {
      const result = await submitForm("newsletter", { email }, {
        subject: "UpsetXociety: newsletter signup",
        summaryLines: [`Email address: ${email}`],
      });
      if (result.mode === "mailto") {
        window.location.href = result.href;
        setState({ status: "mailto", message: "Your email app should open with the signup ready to send." });
      } else {
        setState({ status: "sent", message: "You are on the list. Welcome to the house." });
      }
    } catch (error) {
      setState({ status: "failed", message: error.message });
    }
  }

  return (
    <article className="home-card newsletter-card">
      <div>
        {newsletter.title && (
          <>
            <p className="eyebrow">Newsletter</p>
            <h2>{newsletter.title}</h2>
          </>
        )}
        <p>{newsletter.body}</p>
      </div>

      <form className="newsletter-card__form" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="email">
          Email address
        </label>

        <input
          id="email"
          name="email"
          autoComplete="email"
          type="email"
          placeholder={newsletter.placeholder}
          required
        />

        <button type="submit" disabled={state.status === "sending"}>
          {state.status === "sending" ? "Sending…" : newsletter.buttonLabel}
        </button>
      </form>
      <p role="status" aria-live="polite">{state.message}</p>
    </article>
  );
}

// ---- Portal layout (early-2000s portal: side columns, a hero and a "Today on" panel) ----

function Panel({ title, className = "", children }) {
  return (
    <section className={`portal-panel ${className}`.trim()}>
      <h2 className="portal-panel__title">{title}</h2>
      <div className="portal-panel__body">{children}</div>
    </section>
  );
}

function MoreLink({ to, children }) {
  return (
    <Link to={to} className="portal-more">
      {children} <span aria-hidden="true">»</span>
    </Link>
  );
}

// One section of "Today on UpsetXociety": a labelled bar with a "More" pill, then one item with a Go button.
function TodayRow({ label, more, item }) {
  return (
    <article className="portal-today__row">
      <div className="portal-today__bar">
        <h3>{label}</h3>
        <MoreLink to={more.to}>{more.label}</MoreLink>
      </div>
      <div className={`portal-today__item${item.media ? " portal-today__item--media" : ""}`}>
        {item.media && (
          <Link to={item.to} className="portal-today__media" aria-label={`Open ${item.title}`}>
            {item.media}
          </Link>
        )}
        <div className="portal-today__text">
          {item.meta && <p className="portal-today__meta">{item.meta}</p>}
          <h4>
            <Link to={item.to}>{item.title}</Link>
          </h4>
          {item.excerpt && <p>{item.excerpt}</p>}
          <Link to={item.to} className="portal-go">
            {item.go || "Go"} ›
          </Link>
        </div>
      </div>
    </article>
  );
}

function ShopPanel({ item }) {
  const to = recordPath("/shop", item.slug);
  return (
    <Panel title="From the Shop" className="portal-shop">
      {item.image && (
        <Link to={to} className="portal-shop__media" aria-label={`View ${item.title}`}>
          <img src={item.image} alt={item.imageAlt || item.title} loading="lazy" />
        </Link>
      )}
      <p className="portal-today__meta">{[item.category, item.soldOut ? "Sold out" : item.priceLabel].filter(Boolean).join(" · ")}</p>
      <h3 className="portal-shop__title">
        <Link to={to}>{item.title}</Link>
      </h3>
      {item.excerpt && <p>{item.excerpt}</p>}
      <Link to={to} className="portal-go">
        View ›
      </Link>
      <MoreLink to="/shop">Visit the Shop</MoreLink>
    </Panel>
  );
}

export default function HomePage() {
  const { data: works, status: worksStatus, error: worksError } = useDirectusResource(
    getPublishedWorks,
    [],
    normalizeWork
  );
  const { data: artists, status: artistsStatus } = useDirectusResource(
    getPublishedArtists,
    [],
    normalizeArtist
  );
  // Secondary panels: each is optional and simply hidden if its source fails or is empty.
  const texts = useDirectusResource(getPublishedTexts, [], normalizeText, "home-texts");
  const journal = useDirectusResource(getPublishedJournalEntries, [], normalizeJournalEntry, "home-journal");
  const vault = useDirectusResource(getOpenVaultItems, [], normalizeVaultItem, "home-vault");
  const [heroIndex, setHeroIndex] = useState(0);

  usePageTitle("");

  // Works drive the page; artists only enrich the featured card.
  if (worksStatus === "loading") {
    return <main className="homepage page-content"><ContentState status="loading" /></main>;
  }

  const featuredRecord = works.find((work) => work.featured) || works[0] || null;
  const featuredArtist =
    artistsStatus === "success" && featuredRecord
      ? artists.find((artist) => artist.slug === featuredRecord.artist?.slug)
      : null;

  // The hero cycles through up to five works that have an image ("Next movie 1 2 3 4 5").
  const heroWorks = [featuredRecord, ...works.filter((work) => work !== featuredRecord)].filter((work) => work?.image).slice(0, 5);
  const heroRecord = heroWorks[heroIndex % Math.max(heroWorks.length, 1)] || featuredRecord;
  const hero = {
    title: "UpsetXociety",
    subtitle: "Art House",
    image: heroRecord?.image || "",
    imageAlt: heroRecord?.imageAlt || "",
    href: heroRecord ? recordPath("/works", heroRecord.slug) : "/works",
    ctaLabel: "Enter the archive",
  };
  const relatedWorks = works
    .filter((work) => work.slug !== featuredRecord?.slug)
    .slice(0, 4)
    .map((work) => ({
      ...work,
      href: recordPath("/works", work.slug),
    }));
  const musicWork = works.find((work) => work.audio && work.slug !== featuredRecord?.slug) || works.find((work) => work.audio);
  const latestText = texts.status === "success" ? texts.data[0] : null;
  const latestEntry = journal.status === "success" ? journal.data[0] : null;
  const shopItem =
    vault.status === "success"
      ? vault.data.find((item) => SHOP_CATEGORY_SLUGS.includes(item.categorySlug) && item.buyable) ||
        vault.data.find((item) => SHOP_CATEGORY_SLUGS.includes(item.categorySlug))
      : null;
  const quote = {
    text: "Blackness is lit, don't let anybody tell you it's not.",
    attribution: "Sylvia Wynter",
  };
  const newsletter = {
    title: "",
    body: "News, works, releases and archive updates--occasionally.",
    placeholder: "Enter your email",
    buttonLabel: "Subscribe",
  };

  return (
    <main className="homepage page-content portal">
      <div className="portal-grid">
        {/* ---- Left column ---- */}
        <aside className="portal-col portal-col--left" aria-label="Featured">
          {featuredArtist?.slug && (
            <Panel title="Featured artist" className="portal-artist">
              <ArtistCard artist={featuredArtist} />
            </Panel>
          )}

          <Panel title="Quote" className="portal-quote">
            <QuoteCard quote={quote} />
          </Panel>

          <Panel title="Stay connected" className="portal-newsletter">
            <NewsletterCard newsletter={newsletter} />
          </Panel>

          <Panel title="Bookings + commissions">
            <p>Work with the house.</p>
            <MoreLink to="/commissions">Book a commission</MoreLink>
          </Panel>
        </aside>

        {/* ---- Centre column ---- */}
        <div className="portal-col portal-col--main">
          <section className="portal-panel portal-hero" aria-label="Featured work">
            <HeroCard hero={hero} />
            {heroWorks.length > 1 && (
              <div className="portal-hero__pager">
                <span className="portal-hero__pager-label">Next work »</span>
                {heroWorks.map((work, index) => (
                  <button
                    key={work.slug}
                    type="button"
                    className="portal-hero__page"
                    aria-pressed={index === heroIndex % heroWorks.length}
                    aria-label={`Show ${work.title}`}
                    onClick={() => setHeroIndex(index)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </section>

          {worksStatus === "error" && (
            <ContentState status={isForbiddenError(worksError) ? "closed" : "error"} />
          )}

          <Panel title="Today on UpsetXociety" className="portal-today">
            {featuredRecord && (
              <TodayRow
                label="Works"
                more={{ to: "/works", label: "More works" }}
                item={{
                  to: recordPath("/works", featuredRecord.slug),
                  title: featuredRecord.title,
                  meta: [featuredRecord.type, featuredRecord.year].filter(Boolean).join(" · "),
                  excerpt: featuredRecord.excerpt,
                  media: featuredRecord.image ? (
                    <DitherCanvas id="featured-canvas" src={featuredRecord.image} alt={featuredRecord.imageAlt} />
                  ) : null,
                }}
              />
            )}

            {musicWork && (
              <TodayRow
                label="Music"
                more={{ to: "/works", label: "More music" }}
                item={{
                  to: recordPath("/works", musicWork.slug),
                  title: musicWork.title,
                  meta: [musicWork.artist?.name, musicWork.year].filter(Boolean).join(" · "),
                  excerpt: musicWork.excerpt,
                  go: "Listen",
                  media: musicWork.image ? (
                    <GlowCanvas className="portal-today__canvas" src={musicWork.image} alt={musicWork.imageAlt} />
                  ) : null,
                }}
              />
            )}

            {latestText && (
              <TodayRow
                label="Texts"
                more={{ to: "/texts", label: "More texts" }}
                item={{
                  to: recordPath("/texts", latestText.slug),
                  title: latestText.title,
                  meta: [latestText.category, latestText.author?.name].filter(Boolean).join(" · "),
                  excerpt: latestText.excerpt,
                  go: "Read",
                }}
              />
            )}

            {latestEntry && (
              <TodayRow
                label="Journal"
                more={{ to: "/journal", label: "More journal" }}
                item={{
                  to: recordPath("/journal", latestEntry.slug),
                  title: latestEntry.title,
                  meta: [latestEntry.category, latestEntry.date].filter(Boolean).join(" · "),
                  excerpt: latestEntry.excerpt,
                  go: "Read",
                }}
              />
            )}

            {!featuredRecord && !latestText && !latestEntry && <ContentState status="empty" />}
          </Panel>
        </div>

        {/* ---- Right column ---- */}
        <aside className="portal-col portal-col--right" aria-label="Shop and more works">
          {shopItem && <ShopPanel item={shopItem} />}

          {relatedWorks.length > 0 && (
            <Panel title="More works" className="portal-more-works">
              <div className="related-works-grid">
                {relatedWorks.map((work) => (
                  <WorkCard key={work.slug} work={work} />
                ))}
              </div>
            </Panel>
          )}

          <Panel title="The Vault">
            <p>Original works, limited editions and archive objects.</p>
            <MoreLink to="/vault">Open the Vault</MoreLink>
          </Panel>
        </aside>
      </div>
    </main>
  );
}