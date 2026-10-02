import { Link, useParams } from "react-router-dom";
import ArtistCard from "../components/cards/ArtistCard";
import EntryCard from "../components/cards/EntryCard";
import CardGrid from "../components/layout/CardGrid";
import { DetailHeader, PageIntro } from "../components/layout/PageIntro";
import PageState from "../components/layout/PageState";
import RelatedRail from "../components/rails/RelatedRail";
import ContentState from "../components/ui/ContentState";
import MediaFrame from "../components/ui/MediaFrame";
import Prose from "../components/ui/Prose";
import TextLink from "../components/ui/TextLink";
import {
  getContributorWithFeatures,
  getCreditedContributors,
  getPublishedRazzFeatureBySlug,
  getPublishedRazzFeatures,
  getPublishedRazzIssueBySlug,
  getPublishedRazzIssues,
} from "../lib/queries";
import { normalizeContributor, normalizeRazzFeature, normalizeRazzIssue } from "../lib/normalise";
import { gateStatus, usePageTitle } from "../lib/resourceState";
import useDirectusResource from "../lib/useDirectusResource";
import "./CorePages.css";
import { recordPath } from "../lib/paths";

function contributorLine(contributors) {
  return contributors.map((person) => person.name).join(", ");
}

export function RazzPage() {
  usePageTitle("Razz Magazine");
  const issues = useDirectusResource(getPublishedRazzIssues, [], normalizeRazzIssue);
  const gate = gateStatus(issues);

  if (gate !== "success") return <PageState status={gate} />;

  const [current, ...archive] = issues.data;

  return (
    <main className="core-page page-content">
      <PageIntro
        eyebrow="Razz Magazine"
        title="Razz"
        description="Issues, features, interviews and visual essays from the house and its contributors."
      />

      {current ? (
        <>
          <section className="core-page__list" aria-label="Current issue">
            <EntryCard
              to={recordPath("/razz/issues", current.slug)}
              title={current.title}
              meta={["Current issue", current.issueNumber && `No. ${current.issueNumber}`, current.date]}
              excerpt={current.excerpt}
              image={current.image}
              imageAlt={current.imageAlt}
              linkLabel="Open the issue"
            />
          </section>

          {archive.length > 0 && (
            <section className="core-section" aria-label="Archive">
              <h2>Archive</h2>
              <div className="core-page__list">
                {archive.map((issue) => (
                  <EntryCard
                    key={issue.slug}
                    to={recordPath("/razz/issues", issue.slug)}
                    title={issue.title}
                    meta={[issue.issueNumber && `No. ${issue.issueNumber}`, issue.date]}
                    excerpt={issue.excerpt}
                    image={issue.image}
                    imageAlt={issue.imageAlt}
                    linkLabel="Open the issue"
                    headingLevel={3}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <ContentState status="empty" />
      )}

      <RelatedRail
        title="More from Razz"
        groups={[
          {
            label: "People",
            items: [{ to: "/contributors", label: "Contributors" }],
          },
          {
            label: "Membership",
            items: [{ to: "/newsletter", label: "Hear about new issues first" }],
          },
        ]}
      />
    </main>
  );
}

export function RazzIssuePage() {
  const { slug } = useParams();
  const issueResource = useDirectusResource(
    ({ signal }) => getPublishedRazzIssueBySlug(slug, { signal }),
    null,
    normalizeRazzIssue,
    slug
  );
  const issue = issueResource.data;
  const issueId = issue?.id || "";
  const featuresResource = useDirectusResource(
    ({ signal }) => (issueId ? getPublishedRazzFeatures({ signal, issueId }) : Promise.resolve([])),
    [],
    normalizeRazzFeature,
    `${slug}:${issueId}`
  );
  usePageTitle(issue?.title || "Razz issue");

  const gate = gateStatus(issueResource);
  if (gate !== "success") return <PageState status={gate} />;

  if (!issue) {
    return <PageState status="notFound" actionTo="/razz" actionLabel="Return to Razz" />;
  }

  const features = featuresResource.data;

  return (
    <main className="core-detail page-content">
      <DetailHeader
        eyebrow="Razz Magazine"
        title={issue.title}
        items={[issue.issueNumber && `No. ${issue.issueNumber}`, issue.date]}
      />

      <section className="core-detail__grid">
        {issue.image ? (
          <MediaFrame ratio="3 / 4">
            <img src={issue.image} alt={issue.imageAlt} />
          </MediaFrame>
        ) : (
          <div />
        )}
        <Prose className="core-detail__body" paragraphs={issue.description} fallback="The editorial note for this issue is coming soon." />
      </section>

      <section className="core-section" aria-label="Contents">
        <h2>Contents</h2>
        {featuresResource.status === "loading" ? (
          <ContentState status="loading" />
        ) : features.length ? (
          <div className="core-page__list">
            {features.map((feature) => (
              <EntryCard
                key={feature.slug}
                to={recordPath("/razz/features", feature.slug)}
                title={feature.title}
                meta={[contributorLine(feature.contributors)]}
                excerpt={feature.excerpt}
                linkLabel="Read the feature"
                headingLevel={3}
              />
            ))}
          </div>
        ) : (
          <ContentState status="empty" />
        )}
      </section>

      <RelatedRail
        groups={[
          { label: "Razz", items: [{ to: "/razz", label: "All issues" }] },
        ]}
      />
    </main>
  );
}

export function RazzFeaturePage() {
  const { slug } = useParams();
  const featureResource = useDirectusResource(
    ({ signal }) => getPublishedRazzFeatureBySlug(slug, { signal }),
    null,
    normalizeRazzFeature,
    slug
  );
  const feature = featureResource.data;
  const issueId = feature?.issueId || "";
  const { data: siblings } = useDirectusResource(
    ({ signal }) => (issueId ? getPublishedRazzFeatures({ signal, issueId }) : Promise.resolve([])),
    [],
    normalizeRazzFeature,
    `${slug}:${issueId}`
  );
  usePageTitle(feature?.title || "Razz feature");

  const gate = gateStatus(featureResource);
  if (gate !== "success") return <PageState status={gate} />;

  if (!feature) {
    return <PageState status="notFound" actionTo="/razz" actionLabel="Return to Razz" />;
  }

  return (
    <main className="core-detail page-content">
      <DetailHeader eyebrow="Razz feature" title={feature.title} items={[contributorLine(feature.contributors)]} />

      {feature.contributors.length > 0 && (
        <p className="core-detail__byline">
          {feature.contributors.map((person, index) => (
            <span key={person.slug}>
              {index > 0 && ", "}
              {person.role ? `${person.role}: ` : ""}
              <Link to={recordPath("/contributors", person.slug)}>{person.name}</Link>
            </span>
          ))}
        </p>
      )}

      <Prose paragraphs={feature.paragraphs} fallback="This feature is being prepared.">
        <TextLink to="/razz" arrow>
          Back to Razz
        </TextLink>
      </Prose>

      {feature.gallery.length > 0 && (
        <section className="core-section" aria-label="Images">
          <ul className="core-gallery">
            {feature.gallery.map((item, index) => (
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

      <RelatedRail
        groups={[
          {
            label: "Contributors",
            items: feature.contributors.map((person) => ({ to: recordPath("/contributors", person.slug), label: person.name })),
          },
          {
            label: "More from this issue",
            items: siblings
              .filter((item) => item.slug !== feature.slug)
              .map((item) => ({ to: recordPath("/razz/features", item.slug), label: item.title })),
          },
        ]}
      />
    </main>
  );
}

export function ContributorsPage() {
  usePageTitle("Contributors");
  const contributors = useDirectusResource(getCreditedContributors, [], normalizeContributor);
  const gate = gateStatus(contributors);

  if (gate !== "success") return <PageState status={gate} />;

  return (
    <main className="core-page page-content">
      <PageIntro
        eyebrow="Razz / Contributors"
        title="Contributors"
        description="Writers, photographers, editors and collaborators credited in Razz."
      />
      {contributors.data.length ? (
        <CardGrid min="220px">
          {contributors.data.map((person) => (
            <ArtistCard
              key={person.slug}
              slug={person.slug}
              name={person.name}
              image={person.image}
              imageAlt={person.imageAlt}
              excerpt={person.excerpt}
              basePath="/contributors"
              linkLabel="View contributor"
            />
          ))}
        </CardGrid>
      ) : (
        <ContentState status="empty" actionTo="/razz" actionLabel="Return to Razz" />
      )}
    </main>
  );
}

export function ContributorPage() {
  const { slug } = useParams();
  const contributorResource = useDirectusResource(
    ({ signal }) => getContributorWithFeatures(slug, { signal }),
    null,
    normalizeContributor,
    slug
  );
  const person = contributorResource.data;
  usePageTitle(person?.name || "Contributor");

  const gate = gateStatus(contributorResource);
  if (gate !== "success") return <PageState status={gate} />;

  if (!person) {
    return <PageState status="notFound" actionTo="/contributors" actionLabel="Return to contributors" />;
  }

  return (
    <main className="core-detail page-content">
      <DetailHeader eyebrow="Contributor" title={person.name} />

      <section className="core-detail__grid">
        {person.image ? (
          <MediaFrame ratio="4 / 5">
            <img src={person.image} alt={person.imageAlt} />
          </MediaFrame>
        ) : (
          <div />
        )}
        <Prose className="core-detail__body" paragraphs={person.bio} />
      </section>

      <RelatedRail
        title="In Razz"
        groups={[
          {
            label: "Features",
            items: person.features.map((feature) => ({ to: recordPath("/razz/features", feature.slug), label: feature.title })),
          },
        ]}
      />
    </main>
  );
}
