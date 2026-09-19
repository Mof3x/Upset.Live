import { useParams } from "react-router-dom";
import SectionHeading from "../components/ui/SectionHeading";
import MediaFrame from "../components/ui/MediaFrame";
import MetaLine from "../components/ui/MetaLine";
import TagList from "../components/ui/TagList";
import CardGrid from "../components/layout/CardGrid";
import WorkCard from "../components/cards/WorkCard";
import TextLink from "../components/ui/TextLink";
import ContentState from "../components/ui/ContentState";
import "./ArtistPage.css";
import { artists } from "../mock/artists";

export default function ArtistPage() {
  const { slug } = useParams();
  const artist = artists[slug];

  if (!artist) {
    return (
      <main className="artist-page page-content">
        <ContentState
          status="notFound"
          actionTo="/artists"
          actionLabel="Return to artists"
        />
      </main>
    );
  }

  return (
    <main className="artist-page page-content">
      <section className="artist-page__intro">
        <div className="artist-page__portrait">
          <MediaFrame ratio="4 / 5">
            <img src={artist.image} alt={artist.imageAlt} />
          </MediaFrame>
        </div>

        <div className="artist-page__identity">
          <MetaLine items={[artist.discipline, artist.location]} />

          <h1>{artist.name}</h1>

          <div className="artist-page__bio">
            {artist.bio.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <TagList tags={artist.tags} />

          <TextLink external href={artist.links.instagram} arrow>
            Instagram
          </TextLink>
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

        {artist.works.length ? (
          <CardGrid min="220px">
            {artist.works.map((work) => (
              <WorkCard key={work.slug} {...work} />
            ))}
          </CardGrid>
        ) : (
          <ContentState status="empty" />
        )}
      </section>
    </main>
  );
}