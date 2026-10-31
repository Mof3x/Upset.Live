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
//            <p>Art Haus</p>
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
import ContentState from "../components/ui/ContentState";
import Scene from "../components/hub/Scene";
import Dice from "../components/hub/Dice";
import HubIcon from "../components/hub/HubIcon";
import { HubHeading, HubMedia, RankedList } from "../components/hub/HubParts";
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
import { recordPath } from "../lib/paths";
import "./HomePage.css";
import "./HomeHub.css";

const quote = {
  text: "Blackness is lit, don't let anybody tell you it's not.",
  attribution: "Sylvia Wynter",
};

// The email signup in the "Join the haus" column.
function QuickSignup() {
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
        setState({ status: "sent", message: "You are on the list. Welcome to the haus." });
      }
    } catch (error) {
      setState({ status: "failed", message: error.message });
    }
  }

  return (
    <form className="hub-signup" onSubmit={handleSubmit}>
      <label htmlFor="hub-signup-email">News, works, releases and archive updates, occasionally.</label>
      <div className="hub-signup__row">
        <input id="hub-signup-email" name="email" type="email" autoComplete="email" placeholder="Your email" required />
        <button type="submit" disabled={state.status === "sending"}>
          {state.status === "sending" ? "Sending…" : "Join"}
        </button>
      </div>
      <p role="status" aria-live="polite">{state.message}</p>
    </form>
  );
}

// Flat shapes for the scene, doors, lists and dice.
const asWork = (work) => ({
  key: `work:${work.slug}`,
  kind: work.type || "Work",
  icon: "works",
  title: work.title,
  to: recordPath("/works", work.slug),
  image: work.image,
  imageAlt: work.imageAlt,
  meta: [work.artist?.name, work.year].filter(Boolean).join(" · "),
  audio: work.audio,
});
const asText = (text) => ({
  key: `text:${text.slug}`,
  kind: text.category || "Text",
  icon: "texts",
  title: text.title,
  to: recordPath("/texts", text.slug),
  image: text.image,
  imageAlt: text.imageAlt,
  meta: [text.author?.name, text.date].filter(Boolean).join(" · "),
  go: "Read",
});
const asEntry = (entry) => ({
  key: `journal:${entry.slug}`,
  kind: "Journal",
  icon: "journal",
  title: entry.title,
  to: recordPath("/journal", entry.slug),
  image: entry.image,
  imageAlt: entry.imageAlt,
  meta: entry.date,
  go: "Read",
});
const asArtist = (artist) => ({
  key: `artist:${artist.slug}`,
  kind: "Artist",
  icon: "artists",
  title: artist.name,
  to: recordPath("/artists", artist.slug),
  image: artist.image,
  imageAlt: artist.imageAlt,
  meta: artist.discipline,
  go: "Meet",
});
const asObject = (item, base) => ({
  key: `${base}:${item.slug}`,
  kind: base === "/shop" ? "Shop" : "Vault",
  icon: base === "/shop" ? "shop" : "vault",
  title: item.title,
  to: recordPath(base, item.slug),
  image: item.image,
  imageAlt: item.imageAlt,
  meta: [item.category, item.soldOut ? "Sold out" : item.priceLabel].filter(Boolean).join(" · "),
  go: "View",
});

// Section slides, used while there is little content, so the main board always has a few things to show.
const SECTION_SLIDES = [
  { key: "section:vault", kind: "The Vault", icon: "vault", title: "Originals, editions and archive objects", to: "/vault", go: "Enter" },
  { key: "section:razz", kind: "RazzMag", icon: "razz", title: "Issues, features and visual essays", to: "/razz", go: "Read" },
  { key: "section:commissions", kind: "Bookings", icon: "commissions", title: "Work with the haus", to: "/commissions", go: "Book" },
];

export default function HomePage() {
  const works = useDirectusResource(getPublishedWorks, [], normalizeWork);
  // Everything else is optional: a source that fails or is empty is simply left out.
  const artists = useDirectusResource(getPublishedArtists, [], normalizeArtist, "home-artists");
  const texts = useDirectusResource(getPublishedTexts, [], normalizeText, "home-texts");
  const journal = useDirectusResource(getPublishedJournalEntries, [], normalizeJournalEntry, "home-journal");
  const vault = useDirectusResource(getOpenVaultItems, [], normalizeVaultItem, "home-vault");

  usePageTitle("");

  if (works.status === "loading") {
    return <main className="homepage page-content"><ContentState status="loading" /></main>;
  }

  const ok = (resource) => (resource.status === "success" ? resource.data : []);
  const featured = ok(works).find((work) => work.featured);
  const workItems = [featured, ...ok(works).filter((work) => work !== featured)].filter(Boolean).map(asWork);
  const textItems = ok(texts).map(asText);
  const entryItems = ok(journal).map(asEntry);
  const artistItems = ok(artists).map(asArtist);
  const openItems = ok(vault);
  const shopItems = openItems.filter((item) => SHOP_CATEGORY_SLUGS.includes(item.categorySlug));
  const shopPick = shopItems.find((item) => item.buyable) || shopItems[0];
  const shop = shopPick ? asObject(shopPick, "/shop") : null;
  const vaultItems = openItems
    .filter((item) => !SHOP_CATEGORY_SLUGS.includes(item.categorySlug))
    .map((item) => asObject(item, "/vault"));
  const listen = workItems.find((item) => item.audio) || null;
  const reads = [...textItems, ...entryItems];

  // Main board: works with pictures first, then the newest read, then sections to make it up to three.
  const slides = [...workItems.filter((item) => item.image).slice(0, 4), ...reads.slice(0, 1)];
  slides.push(...SECTION_SLIDES.slice(0, Math.max(0, 3 - slides.length)));

  const onNow = [workItems[0], reads[0], artistItems[0], shop, vaultItems[0]].filter(Boolean).slice(0, 4);
  if (onNow.length < 3) onNow.push(...SECTION_SLIDES.slice(0, 3 - onNow.length));

  // Further along the street: artists, reads and Vault pieces, then a few sections that are always there.
  const streetMore = [
    ...artistItems,
    ...reads.slice(0, 3),
    ...vaultItems.slice(0, 2),
    SECTION_SLIDES[1],
    ...(shop && !vaultItems.length ? [SECTION_SLIDES[0]] : []),
    { key: "section:journal", kind: "Journal", icon: "journal", title: "Notes and updates from the haus", to: "/journal", go: "Read" },
    { key: "section:newsletter", kind: "Newsletter", icon: "newsletter", title: "Join the haus", meta: "News, works and releases, occasionally", to: "/newsletter", go: "Join" },
  ];

  // The doors: every section, pictured by its newest item where there is one.
  const firstImage = (items) => items.find((item) => item.image)?.image || "";
  const doors = [
    { to: "/works", label: "Works", icon: "works", image: firstImage(workItems), count: workItems.length },
    { to: "/artists", label: "Artists", icon: "artists", image: firstImage(artistItems), count: artistItems.length },
    { to: "/texts", label: "Texts", icon: "texts", image: firstImage(textItems), count: textItems.length },
    { to: "/journal", label: "Journal", icon: "journal", image: firstImage(entryItems), count: entryItems.length },
    { to: "/razz", label: "RazzMag", icon: "razz", image: "" },
    { to: "/vault", label: "Vault", icon: "vault", image: firstImage(vaultItems) },
    { to: "/shop", label: "Shop", icon: "shop", image: shop?.image || "" },
    { to: "/commissions", label: "Bookings", icon: "commissions", image: "" },
  ];

  return (
    <main className="homepage page-content hub-home">
      <Scene slides={slides} onNow={onNow} listen={listen} shop={shop} more={streetMore} />

      {works.status === "error" && (
        <ContentState status={isForbiddenError(works.error) ? "closed" : "error"} />
      )}

      <section className="hub-home__section" aria-labelledby="hub-explore">
        <HubHeading icon="home">
          <span id="hub-explore">Explore the haus</span>
        </HubHeading>
        <ul className="hub-doors">
          {doors.map((door) => (
            <li key={door.to}>
              <Link to={door.to} className="hub-door">
                <span className="hub-door__frame">
                  <HubMedia image={door.image} icon={door.icon} />
                </span>
                <span className="hub-door__label">
                  {door.label}
                  {door.count > 0 && <span className="hub-door__count">{door.count}</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Dice pool={[...workItems, ...reads, ...artistItems, ...(shop ? [shop] : []), ...vaultItems]} />

      <section className="hub-home__columns" aria-label="Newest and join">
        <div className="hub-column">
          <h2 className="hub-column__title">
            Newest works <Link to="/works">All ›</Link>
          </h2>
          <RankedList items={workItems.slice(0, 8)} empty="New works arriving soon." />
        </div>
        <div className="hub-column">
          <h2 className="hub-column__title">
            Newest reads <Link to="/texts">All ›</Link>
          </h2>
          <RankedList items={reads.slice(0, 8)} empty="Texts and journal entries arriving soon." />
        </div>
        <div className="hub-column">
          <h2 className="hub-column__title">Join the haus</h2>
          <QuickSignup />
          <p className="hub-column__links">
            <Link to="/commissions">Bookings + commissions ›</Link>
            <Link to="/contact">Say hello ›</Link>
          </p>
        </div>
      </section>

      <blockquote className="hub-quote">
        <p>&ldquo;{quote.text}&rdquo;</p>
        <footer>{quote.attribution}</footer>
      </blockquote>

      <Link to="/works" className="hub-bigpill">
        Enter the archive <HubIcon name="play" />
      </Link>
    </main>
  );
}
