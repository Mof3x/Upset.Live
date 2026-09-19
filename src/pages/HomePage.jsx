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

import { Link } from "react-router-dom";
import GlowCanvas from "../components/atmosphere/glowcanvas";
import DitherCanvas from "../components/atmosphere/dithercanvas";
import ContentState from "../components/ui/ContentState";
import { getPublishedArtists, getPublishedWorks } from "../lib/queries";
import { normalizeArtist, normalizeWork } from "../lib/normalise";
import useDirectusResource from "../lib/useDirectusResource";
import "./HomePage.css";

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
      <GlowCanvas
        id="featured-artist"
        className="artist-card__image"
        src={artist.image}
        alt={artist.imageAlt}
      />

      <div className="artist-card__content">
        <p className="eyebrow">Featured artist</p>
        <h3>{artist.name}</h3>
        <p>{artist.bio}</p>
        <Link className="text-link" to={`/artists/${artist.slug}`}>
          Meet the artist
        </Link>
      </div>
    </article>
  );
}

function FeaturedWorkCard({ work }) {
  return (
    <article className="home-card featured-work-card">
      <header className="card-heading">
        <p className="eyebrow">{work.eyebrow}</p>
        <h2>{work.title}</h2>
      </header>

      <Link
        className="featured-work-card__media"
        to={work.href}
        aria-label={`View ${work.title}`}
      >
        <DitherCanvas
          id="featured-canvas"
          src={work.image}
          alt={work.imageAlt}
        />
      </Link>

      <div className="featured-work-card__body">
        <p>{work.excerpt}</p>

        <Link className="text-link" to={work.href}>
          {work.ctaLabel}
        </Link>
      </div>

      <ArtistCard artist={work.artist} />
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
  function handleSubmit(event) {
    event.preventDefault();

    // Later: send this to your newsletter_signups endpoint.
  }

  return (
    <article className="home-card newsletter-card">
      <div>
        <p className="eyebrow">Newsletter</p>
        <h2>{newsletter.title}</h2>
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

        <button type="submit">{newsletter.buttonLabel}</button>
      </form>
    </article>
  );
}

export default function HomePage() {
  const { data: works, status: worksStatus } = useDirectusResource(
    getPublishedWorks,
    [],
    normalizeWork
  );
  const { data: artists, status: artistsStatus } = useDirectusResource(
    getPublishedArtists,
    [],
    normalizeArtist
  );

  if (worksStatus === "loading" || artistsStatus === "loading") {
    return <main className="homepage page-content"><ContentState status="loading" /></main>;
  }

  if (worksStatus === "error" || artistsStatus === "error") {
    return <main className="homepage page-content"><ContentState status="error" /></main>;
  }

  if (!works.length) {
    return <main className="homepage page-content"><ContentState status="empty" /></main>;
  }

  const featuredRecord = works.find((work) => work.featured) || works[0];
  const featuredArtist = artists.find(
    (artist) => artist.slug === featuredRecord.artist?.slug
  );
  const featuredWork = {
    ...featuredRecord,
    eyebrow: "Featured work",
    href: `/works/${featuredRecord.slug}`,
    ctaLabel: "View the work",
    artist: featuredArtist || featuredRecord.artist,
  };
  const hero = {
    title: "UpsetXociety",
    subtitle: "Art House",
    image: featuredRecord.image,
    imageAlt: featuredRecord.imageAlt,
    href: `/works/${featuredRecord.slug}`,
    ctaLabel: "Enter the archive",
  };
  const relatedWorks = works
    .filter((work) => work.slug !== featuredRecord.slug)
    .slice(0, 4)
    .map((work) => ({
      ...work,
      href: `/works/${work.slug}`,
    }));
  const quote = {
    text: "Blackness is lit, don't let anybody tell you it's not.",
    attribution: "Sylvia Wynter",
  };
  const newsletter = {
    title: "Stay connected",
    body: "News, works, releases and archive updates--occasionally.",
    placeholder: "Enter your email",
    buttonLabel: "Subscribe",
  };

  return (
    <main className="homepage page-content">
      <HeroCard hero={hero} />

      <section className="homepage__content">
        <QuoteCard quote={quote} />

        <FeaturedWorkCard work={featuredWork} />

        <section className="related-works-section" aria-labelledby="related-title">
          <header className="card-heading">
            <p className="eyebrow">Continue exploring</p>
            <h2 id="related-title">Related works</h2>
          </header>

          <div className="related-works-grid">
            {relatedWorks.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        </section>

        <NewsletterCard newsletter={newsletter} />
      </section>
    </main>
  );
}