import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import CardGrid from "../components/layout/CardGrid";
import ArtistCard from "../components/cards/ArtistCard";
import WorkCard from "../components/cards/WorkCard";
import TextCard from "../components/cards/TextCard";
import MediaFrame from "../components/ui/MediaFrame";
import MetaLine from "../components/ui/MetaLine";
import TagList from "../components/ui/TagList";
import TextLink from "../components/ui/TextLink";
import ContentState from "../components/ui/ContentState";
import {
  getPublishedArtists,
  getPublishedTextBySlug,
  getPublishedTexts,
  getPublishedWorkBySlug,
  getPublishedWorks,
} from "../lib/queries";
import { normalizeArtist, normalizeText, normalizeWork } from "../lib/normalise";
import useDirectusResource from "../lib/useDirectusResource";
import "./CorePages.css";

const journalEntries = [
  {
    slug: "first-notes-from-the-archive",
    title: "First notes from the archive",
    category: "Notes",
    year: "2026",
    excerpt:
      "A small record of the images, questions and fragments currently moving through UpsetXociety.",
    relatedTextSlug: "towards-an-archive-of-night",
    relatedWorkSlug: "night-study",
  },
];

function PageIntro({ eyebrow, title, description }) {
  return (
    <header className="core-page__intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </header>
  );
}

function DetailHeader({ eyebrow, title, items = [] }) {
  return (
    <header className="core-detail__header">
      <MetaLine items={[eyebrow, ...items]} />
      <h1>{title}</h1>
    </header>
  );
}

function CategoryNav({ label, categories, activeCategory, onChange }) {
  return (
    <nav className="category-nav" aria-label={label}>
      <p className="category-nav__label">Filter by</p>
      <div className="category-nav__options">
        {categories.map((category) => (
          <button
            className="category-nav__option"
            type="button"
            key={category}
            aria-pressed={activeCategory === category}
            onClick={() => onChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </nav>
  );
}

export function AboutPage() {
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
        <TextLink to="/artists" arrow>
          Meet the artists
        </TextLink>
      </section>
    </main>
  );
}

export function ArtistsPage() {
  const { data: artistRecords, status } = useDirectusResource(
    getPublishedArtists,
    [],
    normalizeArtist
  );
  if (status === "loading" || status === "error") {
    return <main className="core-page page-content"><ContentState status={status} /></main>;
  }

  return (
    <main className="core-page page-content">
      <PageIntro
        eyebrow="About / Artists"
        title="Artists"
        description="The people and practices shaping the archive."
      />
      {artistRecords.length ? (
        <CardGrid min="220px">
          {artistRecords.map((artist) => (
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
  const [activeCategory, setActiveCategory] = useState("All");
  const { data: workRecords, status } = useDirectusResource(
    getPublishedWorks,
    [],
    normalizeWork
  );
  if (status === "loading" || status === "error") {
    return <main className="core-page page-content"><ContentState status={status} /></main>;
  }
  const categories = [
    "All",
    ...new Set(workRecords.map((work) => work.type).filter(Boolean)),
  ];
  const filteredWorks =
    activeCategory === "All"
      ? workRecords
      : workRecords.filter((work) => work.type === activeCategory);

  return (
    <main className="core-page page-content">
      <PageIntro
        eyebrow="Archive / Works"
        title="Works"
        description="Paintings, images, objects and other forms in the collection."
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
  const { data: work, status: workStatus } = useDirectusResource(
    ({ signal }) => getPublishedWorkBySlug(slug, { signal }),
    null,
    normalizeWork,
    slug
  );
  const { data: textRecords, status: textStatus } = useDirectusResource(
    getPublishedTexts,
    [],
    normalizeText
  );
  if (workStatus === "loading" || textStatus === "loading") {
    return <main className="core-page page-content"><ContentState status="loading" /></main>;
  }
  if (workStatus === "error" || textStatus === "error") {
    return <main className="core-page page-content"><ContentState status="error" /></main>;
  }
  const relatedTexts = work?.relatedTextSlugs
    ?.map((textSlug) => textRecords.find((text) => text.slug === textSlug))
    .filter(Boolean);
  const relatedJournal = work?.relatedJournalSlug
    ? journalEntries.find((entry) => entry.slug === work.relatedJournalSlug)
    : null;

  if (!work) {
    return (
      <main className="core-page page-content">
        <ContentState
          status="notFound"
          actionTo="/works"
          actionLabel="Return to works"
        />
      </main>
    );
  }

  return (
    <main className="core-detail page-content">
      <DetailHeader
        eyebrow="Work"
        title={work.title}
        items={[work.type, work.year]}
      />

      <section className="core-detail__grid">
        <MediaFrame ratio="4 / 3">
          <img src={work.image} alt={work.imageAlt || work.title} />
        </MediaFrame>

        <div className="core-detail__body">
          {work.excerpt && <p>{work.excerpt}</p>}
          {work.artist && (
            <p>
              By <Link to={`/artists/${work.artist.slug}`}>{work.artist.name}</Link>
            </p>
          )}
          <TagList tags={work.tags} />
          <TextLink to="/works" arrow>
            Back to works
          </TextLink>
        </div>
      </section>

      {(relatedTexts?.length || relatedJournal) && (
        <RelatedContent
          texts={relatedTexts}
          journal={relatedJournal}
        />
      )}
    </main>
  );
}

export function TextsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const { data: textRecords, status } = useDirectusResource(
    getPublishedTexts,
    [],
    normalizeText
  );
  if (status === "loading" || status === "error") {
    return <main className="core-page page-content"><ContentState status={status} /></main>;
  }
  const categories = [
    "All",
    ...new Set(textRecords.map((text) => text.category).filter(Boolean)),
  ];
  const filteredTexts =
    activeCategory === "All"
      ? textRecords
      : textRecords.filter((text) => text.category === activeCategory);

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
  const { data: text, status: textStatus } = useDirectusResource(
    ({ signal }) => getPublishedTextBySlug(slug, { signal }),
    null,
    normalizeText,
    slug
  );
  const { data: workRecords, status: workStatus } = useDirectusResource(
    getPublishedWorks,
    [],
    normalizeWork
  );
  if (textStatus === "loading" || workStatus === "loading") {
    return <main className="core-page page-content"><ContentState status="loading" /></main>;
  }
  if (textStatus === "error" || workStatus === "error") {
    return <main className="core-page page-content"><ContentState status="error" /></main>;
  }
  const relatedWorks = text?.relatedWorkSlugs
    ?.map((workSlug) => workRecords.find((work) => work.slug === workSlug))
    .filter(Boolean);
  const relatedJournal = text?.relatedJournalSlug
    ? journalEntries.find((entry) => entry.slug === text.relatedJournalSlug)
    : null;

  if (!text) {
    return (
      <main className="core-page page-content">
        <ContentState
          status="notFound"
          actionTo="/texts"
          actionLabel="Return to texts"
        />
      </main>
    );
  }

  return (
    <main className="core-detail page-content">
      <DetailHeader
        eyebrow={text.category}
        title={text.title}
        items={[text.type, text.year]}
      />
      <article className="core-detail__article">
        <p>{text.excerpt}</p>
        <p className="core-detail__placeholder">
          The full text will be published here when the editorial record is
          ready.
        </p>
        {text.author && (
          <p>
            By <Link to={`/artists/${text.author.slug}`}>{text.author.name}</Link>
          </p>
        )}
        <TagList tags={text.tags} />
        <TextLink to="/texts" arrow>
          Back to texts
        </TextLink>
      </article>

      {(relatedWorks?.length || relatedJournal) && (
        <RelatedContent
          works={relatedWorks}
          journal={relatedJournal}
        />
      )}
    </main>
  );
}

function RelatedContent({ works = [], texts = [], journal }) {
  return (
    <section className="related-content" aria-labelledby="related-content-title">
      <h2 id="related-content-title">Continue through the archive</h2>
      <div className="related-content__links">
        {works.map((work) => (
          <TextLink key={work.slug} to={`/works/${work.slug}`} arrow>
            Return to {work.title}
          </TextLink>
        ))}
        {texts.map((text) => (
          <TextLink key={text.slug} to={`/texts/${text.slug}`} arrow>
            Read {text.title}
          </TextLink>
        ))}
        {journal && (
          <TextLink to={`/journal/${journal.slug}`} arrow>
            Read {journal.title}
          </TextLink>
        )}
      </div>
    </section>
  );
}

export function JournalPage() {
  return (
    <main className="core-page page-content">
      <PageIntro
        eyebrow="Journal"
        title="Updates from the house"
        description="Process, reflections, notes and signals from the archive."
      />
      {journalEntries.length ? (
        <div className="core-page__list">
          {journalEntries.map((entry) => (
            <article className="journal-card" key={entry.slug}>
              <MetaLine items={[entry.category, entry.year]} />
              <h2><Link to={`/journal/${entry.slug}`}>{entry.title}</Link></h2>
              <p>{entry.excerpt}</p>
              <TextLink to={`/journal/${entry.slug}`} arrow>
                Read entry
              </TextLink>
            </article>
          ))}
        </div>
      ) : (
        <ContentState status="empty" />
      )}
    </main>
  );
}

export function JournalPostPage() {
  const { slug } = useParams();
  const entry = journalEntries.find((record) => record.slug === slug);
  const { data: textRecords, status: textStatus } = useDirectusResource(
    getPublishedTexts,
    [],
    normalizeText
  );
  const { data: workRecords, status: workStatus } = useDirectusResource(
    getPublishedWorks,
    [],
    normalizeWork
  );
  if (textStatus === "loading" || workStatus === "loading") {
    return <main className="core-page page-content"><ContentState status="loading" /></main>;
  }
  if (textStatus === "error" || workStatus === "error") {
    return <main className="core-page page-content"><ContentState status="error" /></main>;
  }
  const relatedText = entry?.relatedTextSlug
    ? textRecords.find((text) => text.slug === entry.relatedTextSlug)
    : null;
  const relatedWork = entry?.relatedWorkSlug
    ? workRecords.find((work) => work.slug === entry.relatedWorkSlug)
    : null;

  if (!entry) {
    return (
      <main className="core-page page-content">
        <ContentState
          status="notFound"
          actionTo="/journal"
          actionLabel="Return to journal"
        />
      </main>
    );
  }

  return (
    <main className="core-detail page-content">
      <DetailHeader eyebrow="Journal" title={entry.title} items={[entry.category, entry.year]} />
      <article className="core-detail__article">
        <p>{entry.excerpt}</p>
        <p className="core-detail__placeholder">
          This journal entry is ready for its full editorial record.
        </p>
        <TextLink to="/journal" arrow>
          Back to journal
        </TextLink>
      </article>

      {(relatedText || relatedWork) && (
        <RelatedContent
          texts={relatedText ? [relatedText] : []}
          works={relatedWork ? [relatedWork] : []}
        />
      )}
    </main>
  );
}

export function VaultPage() {
  return (
    <main className="core-page page-content">
      <PageIntro
        eyebrow="Archive / Vault"
        title="Vault"
        description="A slower room for original works, limited editions and archive objects."
      />
      <section className="core-page__prose">
        <p>
          Vault objects will open with provenance, edition details and a
          request-information path. Public editions will live in the Shop.
        </p>
        <TextLink to="/shop" arrow>
          Visit the Shop
        </TextLink>
      </section>
    </main>
  );
}

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="core-page page-content">
      <PageIntro
        eyebrow="Contact"
        title="Bring us a question, idea or proposition."
        description="For general enquiries, collaborations and commissions."
      />
      <form className="contact-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input name="name" type="text" autoComplete="name" required />
        </label>
        <label>
          Email
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          Message
          <textarea name="message" rows="7" required />
        </label>
        <button type="submit">Send enquiry</button>
        {submitted && (
          <p role="status">
            Your enquiry is recorded locally for now. Delivery will be connected
            when the contact endpoint is ready.
          </p>
        )}
      </form>
    </main>
  );
}
