import { Link } from "react-router-dom";
import MediaFrame from "../ui/MediaFrame";
import MetaLine from "../ui/MetaLine";
import TagList from "../ui/TagList";
import TextLink from "../ui/TextLink";
import "./ArtistCard.css";

export default function ArtistCard({
  slug,
  name,
  image,
  imageAlt,
  discipline,
  location,
  excerpt,
  bio,
  tags = [],
}) {
  const description = excerpt || (Array.isArray(bio) ? bio[0] : bio);

  return (
    <article className="artist-card">
      <Link
        to={`/artists/${slug}`}
        className="artist-card__image-link"
        aria-label={`View ${name}`}
      >
        <MediaFrame ratio="4 / 5">
          <img src={image} alt={imageAlt || `Portrait of ${name}`} />
        </MediaFrame>
      </Link>

      <div className="artist-card__body">
        <MetaLine items={[discipline, location]} />

        <h3 className="artist-card__title">
          <Link to={`/artists/${slug}`}>{name}</Link>
        </h3>

        {description && <p className="artist-card__excerpt">{description}</p>}

        <TagList tags={tags} />

        <TextLink to={`/artists/${slug}`} arrow>
          View artist
        </TextLink>
      </div>
    </article>
  );
}