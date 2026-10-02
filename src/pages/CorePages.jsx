import { Fragment } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import CardGrid from "../components/layout/CardGrid";
import ArtistCard from "../components/cards/ArtistCard";
import WorkCard from "../components/cards/WorkCard";
import TextCard from "../components/cards/TextCard";
import { DetailHeader, PageIntro } from "../components/layout/PageIntro";
import PageState from "../components/layout/PageState";
import RelatedRail from "../components/rails/RelatedRail";
import CategoryNav from "../components/ui/CategoryNav";
import ContentState from "../components/ui/ContentState";
import MediaFrame from "../components/ui/MediaFrame";
import Prose from "../components/ui/Prose";
import TagList from "../components/ui/TagList";
import TextLink from "../components/ui/TextLink";
import AudioPlayer from "../components/audio/AudioPlayer";
import ListenLinks from "../components/audio/ListenLinks";
import {
  getPublishedArtists,
  getPublishedTextBySlug,
  getPublishedTexts,
  getPublishedWorkBySlug,
  getPublishedWorks,
} from "../lib/queries";
import { normalizeArtist, normalizeText, normalizeWork } from "../lib/normalise";
import { gateStatus, usePageTitle } from "../lib/resourceState";
import useDirectusResource from "../lib/useDirectusResource";
import "./CorePages.css";
import { recordPath } from "../lib/paths";

// Category filter kept in the URL (?category=...) so filtered views can be linked.
function useCategoryParam() {
  const [searchParams, setSearchParams] = useSearchParams();
  const active = searchParams.get("category") || "All";

  function setActive(category) {
    const next = new URLSearchParams(searchParams);
    if (category === "All") next.delete("category");
    else next.set("category", category);
    setSearchParams(next, { replace: true });
  }

  return [active, setActive];
}

export function AboutPage() {
  usePageTitle("About");

  return (
    <main className="core-page page-content">
      <PageIntro
        eyebrow="About"
        title="A living house for image, sound and thought."
        description="UpsetXociety is an independent art-house archive bringing visual art, music, writing and collective memory into the same room."
      />

      <section className="core-page__prose">
        <p>
          The archive is a place for work to stay connected to the people,
          histories and ideas around it. It moves between finished pieces,
          process, reflection and future forms.
        </p>
        <TextLink to="/about/ethos" arrow>
          Read the ethos
        </TextLink>
        <TextLink to="/artists" arrow>
          Meet the artists
        </TextLink>
        <TextLink to="/commissions" arrow>
          Bookings and commissions
        </TextLink>
        <TextLink to="/contact" arrow>
          Get in touch
        </TextLink>
      </section>
    </main>
  );
}

// The ethos statement is a Directus text with the slug "ethos". Until one is
// published the page shows the heading from the site plan.
export function EthosPage() {
  usePageTitle("Ethos");
  const { data: text, status } = useDirectusResource(
    ({ signal }) => getPublishedTextBySlug("ethos", { signal }),
    null,
    normalizeText,
    "ethos"
  );

  if (status === "loading") return <PageState status="loading" />;

  return (
    <main className="core-page page-content">
      <PageIntro
        eyebrow="About / Ethos"
        title={text?.title || "African Gothic"}
        description={text ? "" : "The ethos of the house."}
      />
      <Prose
        className="core-page__prose"
        paragraphs={text?.paragraphs || []}
        fallback="The full ethos statement is being written by the collective."
      >
        <TextLink to="/artists" arrow>
          Meet the artists
        </TextLink>
      </Prose>
    </main>
  );
}

export function ArtistsPage() {
  usePageTitle("Artists");
  const artists = useDirectusResource(getPublishedArtists, [], normalizeArtist);
  const gate = gateStatus(artists);

  if (gate !== "success") return <PageState status={gate} />;

  return (
    <main className="core-page page-content">
      <PageIntro
        eyebrow="About / Artists"
        title="Artists"
        description="The people and practices shaping the archive."
      />
      {artists.data.length ? (
        <CardGrid min="220px">
          {artists.data.map((artist) => (
            <ArtistCard key={artist.slug} {...artist} />
          ))}
        </CardGrid>
      ) : (
        <ContentState status="empty" actionTo="/" actionLabel="Return home" />
      )}
    </main>
  );
}

export function WorksPage() {
  usePageTitle("Works");
  const [activeCategory, setActiveCategory] = useCategoryParam();
  const works = useDirectusResource(getPublishedWorks, [], normalizeWork);
  const gate = gateStatus(works);

  if (gate !== "success") return <PageState status={gate} />;

  const categories = [
    "All",
    ...new Set(works.data.map((work) => work.type).filter(Boolean)),
  ];
  const filteredWorks =
    activeCategory === "All"
      ? works.data
      : works.data.filter((work) => work.type === activeCategory);

  return (
    <main className="core-page page-content">
      <PageIntro
        eyebrow="Archive / Works"
        title="Works"
        description="Paintings, images, objects, releases and performances in the collection."
      />
      <CategoryNav
        label="Filter works by category"
        categories={categories}
        activeCategory={activeCategory}
        onChange={setActiveCategory}
      />
      {filteredWorks.length ? (
        <CardGrid min="220px">
          {filteredWorks.map((work) => <WorkCard key={work.slug} {...work} />)}
        </CardGrid>
      ) : (
        <ContentState status="empty" />
      )}
    </main>
  );
}

export function WorkPage() {
  const { slug } = useParams();
  const workResource = useDirectusResource(
    ({ signal }) => getPublishedWorkBySlug(slug, { signal }),
    null,
    normalizeWork,
    slug
  );
  const work = workResource.data;
  const categorySlug = work?.categorySlug || "";
  const { data: categoryWorks } = useDirectusResource(
    ({ signal }) =>
      categorySlug ? getPublishedWorks({ signal, categorySlug, limit: 5 }) : Promise.resolve([]),
    [],
    normalizeWork,
    `${slug}:${categorySlug}`
  );
  usePageTitle(work?.title || "Work");

  const gate = gateStatus(workResource);
  if (gate !== "success") return <PageState status={gate} />;

  if (!work) {
    return <PageState status="notFound" actionTo="/works" actionLabel="Return to works" />;
  }

  const facts = [
    ["Year", work.year],
    ["Medium", work.medium],
    ["Dimensions", work.dimensions],
    ["Category", work.type !== "Work" ? work.type : ""],
  ].filter(([, value]) => value);
  const moreWorks = categoryWorks.filter((item) => item.slug !== work.slug).slice(0, 4);

  return (
    <main className="core-detail page-content">
      <DetailHeader eyebrow="Work" title={work.title} items={[work.type, work.year]} />

      <section className="core-detail__grid">
        {work.image ? (
          <MediaFrame ratio="4 / 3">
            <img src={work.image} alt={work.imageAlt || work.title} />
          </MediaFrame>
        ) : (
          <div />
        )}

        <div className="core-detail__body">
          {work.description.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}

          {/* Music: each part shows only when the work has it. */}
          {work.audio && <AudioPlayer track={{ ...work.audio, href: recordPath("/works", work.slug) }} />}
          <ListenLinks links={work.listenLinks} />

          {work.artists.length > 0 && (
            <ul className="core-detail__credits" aria-label="Credits">
              {work.artists.map((artist) => (
                <li key={artist.slug}>
                  {artist.role ? `${artist.role}: ` : "By "}
                  <Link to={recordPath("/artists", artist.slug)}>{artist.name}</Link>
                </li>
              ))}
            </ul>
          )}

          {facts.length > 0 && (
            <dl className="core-detail__facts">
              {facts.map(([label, value]) => (
                <Fragment key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </Fragment>
              ))}
            </dl>
          )}

          <TagList tags={work.tags} />
          <TextLink to="/works" arrow>
            Back to works
          </TextLink>
        </div>
      </section>

      {work.gallery.length > 0 && (
        <section className="core-section" aria-label="Gallery">
          <ul className="core-gallery">
            {work.gallery.map((item, index) => (
              <li key={`${item.url}-${index}`}>
                <figure>
                  <MediaFrame ratio="4 / 3">
                    <img src={item.url} alt={item.alt} loading="lazy" />
                  </MediaFrame>
                  {item.caption && <figcaption>{item.caption}</figcaption>}
                </figure>
              </li>
            ))}
          </ul>
        </section>
      )}

      {moreWorks.length > 0 && (
        <section className="core-section" aria-label={`More ${work.type}`}>
          <h2>More {work.type.toLowerCase()}</h2>
          <CardGrid min="200px">
            {moreWorks.map((item) => <WorkCard key={item.slug} {...item} />)}
          </CardGrid>
        </section>
      )}

      <RelatedRail
        groups={[
          {
            label: "Artist",
            items: work.artists.map((artist) => ({ to: recordPath("/artists", artist.slug), label: `Meet ${artist.name}` })),
          },
          {
            label: "Related texts",
            items: work.relatedTexts.map((text) => ({ to: recordPath("/texts", text.slug), label: `Read ${text.title}` })),
          },
          {
            label: "Commissions",
            items: [{ to: "/commissions", label: "Enquire about a commission" }],
          },
        ]}
      />
    </main>
  );
}

export function TextsPage() {
  usePageTitle("Texts");
  const [activeCategory, setActiveCategory] = useCategoryParam();
  const texts = useDirectusResource(getPublishedTexts, [], normalizeText);
  const gate = gateStatus(texts);

  if (gate !== "success") return <PageState status={gate} />;

  const categories = [
    "All",
    ...new Set(texts.data.map((text) => text.category).filter(Boolean)),
  ];
  const filteredTexts =
    activeCategory === "All"
      ? texts.data
      : texts.data.filter((text) => text.category === activeCategory);

  return (
    <main className="core-page page-content">
      <PageIntro
        eyebrow="Archive / Texts"
        title="Texts"
        description="Poetry, essays, manifestos and writing from the wider practice."
      />
      <CategoryNav
        label="Filter texts by category"
        categories={categories}
        activeCategory={activeCategory}
        onChange={setActiveCategory}
      />
      {filteredTexts.length ? (
        <div className="core-page__list">
          {filteredTexts.map((text) => <TextCard key={text.slug} {...text} />)}
        </div>
      ) : (
        <ContentState status="empty" />
      )}
    </main>
  );
}

export function TextPage() {
  const { slug } = useParams();
  const textResource = useDirectusResource(
    ({ signal }) => getPublishedTextBySlug(slug, { signal }),
    null,
    normalizeText,
    slug
  );
  const text = textResource.data;
  usePageTitle(text?.title || "Text");

  const gate = gateStatus(textResource);
  if (gate !== "success") return <PageState status={gate} />;

  if (!text) {
    return <PageState status="notFound" actionTo="/texts" actionLabel="Return to texts" />;
  }

  return (
    <main className="core-detail page-content">
      <DetailHeader eyebrow={text.category || "Text"} title={text.title} items={[text.date]} />

      {text.authors.length > 0 && (
        <p className="core-detail__byline">
          By{" "}
          {text.authors.map((author, index) => (
            <span key={author.slug}>
              {index > 0 && ", "}
              <Link to={recordPath("/artists", author.slug)}>{author.name}</Link>
            </span>
          ))}
        </p>
      )}

      {text.image && (
        <div className="core-detail__lead">
          <MediaFrame ratio="16 / 9">
            <img src={text.image} alt={text.imageAlt} />
          </MediaFrame>
        </div>
      )}

      <Prose paragraphs={text.paragraphs} fallback="The full text will be published here soon.">
        <TagList tags={text.tags} />
        <TextLink to="/texts" arrow>
          Back to texts
        </TextLink>
      </Prose>

      <RelatedRail
        groups={[
          {
            label: "Author",
            items: text.authors.map((author) => ({ to: recordPath("/artists", author.slug), label: `Meet ${author.name}` })),
          },
          {
            label: "Related works",
            items: text.relatedWorks.map((work) => ({ to: recordPath("/works", work.slug), label: `View ${work.title}` })),
          },
        ]}
      />
    </main>
  );
}
