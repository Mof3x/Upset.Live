import { useParams } from "react-router-dom";
import SectionHeading from "../components/ui/SectionHeading";
import MediaFrame from "../components/ui/MediaFrame";
import MetaLine from "../components/ui/MetaLine";
import TagList from "../components/ui/TagList";
import CardGrid from "../components/layout/CardGrid";
import PageState from "../components/layout/PageState";
import RelatedRail from "../components/rails/RelatedRail";
import WorkCard from "../components/cards/WorkCard";
import TextCard from "../components/cards/TextCard";
import TextLink from "../components/ui/TextLink";
import ContentState from "../components/ui/ContentState";
import "./ArtistPage.css";
import {
  getPublishedArtistBySlug,
  getPublishedTextsByAuthorSlug,
  getPublishedWorksByArtistSlug,
} from "../lib/queries";
import { normalizeArtist, normalizeText, normalizeWork } from "../lib/normalise";
import { gateStatus, usePageTitle } from "../lib/resourceState";
import useDirectusResource from "../lib/useDirectusResource";

export default function ArtistPage() {
  const { slug } = useParams();
  const artistResource = useDirectusResource(
    ({ signal }) => getPublishedArtistBySlug(slug, { signal }),
    null,
    normalizeArtist,
    slug
  );
  // Works and texts are secondary: if they fail, the profile still renders.
  const works = useDirectusResource(
    ({ signal }) => getPublishedWorksByArtistSlug(slug, { signal }),
    [],
    normalizeWork,
    slug
  );
  const texts = useDirectusResource(
    ({ signal }) => getPublishedTextsByAuthorSlug(slug, { signal }),
    [],
    normalizeText,
    slug
  );
  const artist = artistResource.data;
  usePageTitle(artist?.name || "Artist");

  const gate = gateStatus(artistResource);
  if (gate !== "success") return <PageState status={gate} className="artist-page" />;

  if (!artist) {
    return (
      <PageState
        status="notFound"
        className="artist-page"
        actionTo="/artists"
        actionLabel="Return to artists"
      />
    );
  }

  const workList = works.status === "success" ? works.data : [];
  const textList = texts.status === "success" ? texts.data : [];

  return (
    <main className="artist-page page-content">
      <section className="artist-page__intro">
        {artist.image && (
          <div className="artist-page__portrait">
            <MediaFrame ratio="4 / 5">
              <img src={artist.image} alt={artist.imageAlt} />
            </MediaFrame>
          </div>
        )}

        <div className="artist-page__identity">
          <MetaLine items={[artist.discipline, artist.location]} />

          <h1>{artist.name}</h1>

          <div className="artist-page__bio">
            {artist.bio.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <TagList tags={artist.tags} />

          {artist.links.instagram && (
            <TextLink external href={artist.links.instagram} arrow>
              Instagram
            </TextLink>
          )}
          {artist.links.website && (
            <TextLink external href={artist.links.website} arrow>
              Website
            </TextLink>
          )}
        </div>
      </section>

      <section className="artist-page__works">
        <SectionHeading
          eyebrow="Selected work"
          title={`Works by ${artist.name}`}
          subtitle="A selection from the archive."
          linkTo="/works"
          linkLabel="View all works"
        />

        {works.status === "loading" ? (
          <ContentState status="loading" />
        ) : workList.length ? (
          <CardGrid min="220px">
            {workList.map((work) => (
              <WorkCard key={work.slug} {...work} />
            ))}
          </CardGrid>
        ) : (
          <ContentState status="empty" />
        )}
      </section>

      {textList.length > 0 && (
        <section className="artist-page__works">
          <SectionHeading eyebrow="Writing" title={`Texts by ${artist.name}`} linkTo="/texts" linkLabel="All texts" />
          <div className="core-page__list">
            {textList.map((text) => (
              <TextCard key={text.slug} {...text} />
            ))}
          </div>
        </section>
      )}

      <RelatedRail
        title="Work with the artist"
        groups={[
          {
            label: "Commissions",
            items: [{ to: "/commissions", label: "Book a commission" }],
          },
        ]}
      />
    </main>
  );
}
