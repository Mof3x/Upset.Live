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
  basePath = "/artists",
  linkLabel = "View artist",
}) {
  const description = excerpt || (Array.isArray(bio) ? bio[0] : bio);
  const to = `${basePath}/${slug}`;

  return (
    <article className="artist-card">
      {image && (
        <Link
          to={to}
          className="artist-card__image-link"
          aria-label={`View ${name}`}
        >
          <MediaFrame ratio="4 / 5">
            <img src={image} alt={imageAlt || `Portrait of ${name}`} loading="lazy" />
          </MediaFrame>
        </Link>
      )}

      <div className="artist-card__body">
        <MetaLine items={[discipline, location]} />

        <h3 className="artist-card__title">
          <Link to={to}>{name}</Link>
        </h3>

        {description && <p className="artist-card__excerpt">{description}</p>}

        <TagList tags={tags} />

        <TextLink to={to} arrow>
          {linkLabel}
        </TextLink>
      </div>
    </article>
  );
}