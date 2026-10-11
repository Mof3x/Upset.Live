import { useState } from "react";
import { useParams } from "react-router-dom";
import EntryCard from "../components/cards/EntryCard";
import { DetailHeader, PageIntro } from "../components/layout/PageIntro";
import PageState from "../components/layout/PageState";
import RelatedRail from "../components/rails/RelatedRail";
import CategoryNav from "../components/ui/CategoryNav";
import ContentState from "../components/ui/ContentState";
import MediaFrame from "../components/ui/MediaFrame";
import Prose from "../components/ui/Prose";
import TagList from "../components/ui/TagList";
import TextLink from "../components/ui/TextLink";
import { getPublishedJournalEntries, getPublishedJournalEntryBySlug } from "../lib/queries";
import { normalizeJournalEntry } from "../lib/normalise";
import { gateStatus, usePageTitle } from "../lib/resourceState";
import useDirectusResource from "../lib/useDirectusResource";
import "./CorePages.css";
import { recordPath } from "../lib/paths";

export function JournalPage() {
  usePageTitle("Journal");
  const [activeCategory, setActiveCategory] = useState("All");
  const entries = useDirectusResource(getPublishedJournalEntries, [], normalizeJournalEntry);
  const gate = gateStatus(entries);

  if (gate !== "success") return <PageState status={gate} />;

  const categories = ["All", ...new Set(entries.data.map((entry) => entry.category).filter(Boolean))];
  const visible =
    activeCategory === "All" ? entries.data : entries.data.filter((entry) => entry.category === activeCategory);

  return (
    <main className="core-page page-content">
      <PageIntro
        eyebrow="Journal"
        title="Amebo"
        description="Intellectual gist."
      />
      <CategoryNav
        label="Filter journal by category"
        categories={categories}
        activeCategory={activeCategory}
        onChange={setActiveCategory}
      />
      {visible.length ? (
        <div className="core-page__list">
          {visible.map((entry) => (
            <EntryCard
              key={entry.slug}
              to={recordPath("/journal", entry.slug)}
              title={entry.title}
              meta={[entry.category, entry.date]}
              excerpt={entry.excerpt}
              tags={entry.tags}
              image={entry.image}
              imageAlt={entry.imageAlt}
              linkLabel="Read entry"
            />
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
  const entryResource = useDirectusResource(
    ({ signal }) => getPublishedJournalEntryBySlug(slug, { signal }),
    null,
    normalizeJournalEntry,
    slug
  );
  const { data: allEntries } = useDirectusResource(getPublishedJournalEntries, [], normalizeJournalEntry);
  const entry = entryResource.data;
  usePageTitle(entry?.title || "Journal");

  const gate = gateStatus(entryResource);
  if (gate !== "success") return <PageState status={gate} />;

  if (!entry) {
    return <PageState status="notFound" actionTo="/journal" actionLabel="Return to journal" />;
  }

  // "Recent threads": other entries from the same category, newest first.
  const threads = allEntries
    .filter((other) => other.slug !== entry.slug && (!entry.category || other.category === entry.category))
    .slice(0, 4);

  return (
    <main className="core-detail page-content">
      <DetailHeader eyebrow="Journal" title={entry.title} items={[entry.category, entry.date]} />

      {entry.image && (
        <div className="core-detail__lead">
          <MediaFrame ratio="16 / 9">
            <img src={entry.image} alt={entry.imageAlt} />
          </MediaFrame>
        </div>
      )}

      <Prose paragraphs={entry.paragraphs} fallback="This entry is being written.">
        <TagList tags={entry.tags} />
        <TextLink to="/newsletter" arrow>
          Join the list for what comes next
        </TextLink>
        <TextLink to="/journal" arrow>
          Back to journal
        </TextLink>
      </Prose>

      <RelatedRail
        title="Recent threads"
        groups={[
          {
            label: entry.category ? `More ${entry.category.toLowerCase()}` : "More from the journal",
            items: threads.map((thread) => ({ to: recordPath("/journal", thread.slug), label: thread.title })),
          },
        ]}
      />
    </main>
  );
}
