import { Link } from "react-router-dom";
import MediaFrame from "../ui/MediaFrame";
import MetaLine from "../ui/MetaLine";
import TagList from "../ui/TagList";
import TextLink from "../ui/TextLink";
import "./WorkCard.css";

export default function WorkCard({
  slug,
  title,
  image,
  imageAlt,
  artist,
  type,
  year,
  excerpt,
  tags = [],
}) {
  return (
    <article className="work-card">
      <Link
        to={`/works/${slug}`}
        className="work-card__image-link"
        aria-label={`View ${title}`}
      >
        <MediaFrame ratio="4 / 3">
          <img src={image} alt={imageAlt || title} />
        </MediaFrame>
      </Link>

      <div className="work-card__body">
        <MetaLine items={[type, year]} />

        <h3 className="work-card__title">
          <Link to={`/works/${slug}`}>{title}</Link>
        </h3>

        {artist && (
          <p className="work-card__artist">
            By{" "}
            <Link to={`/artists/${artist.slug}`}>
              {artist.name}
            </Link>
          </p>
        )}

        {excerpt && <p className="work-card__excerpt">{excerpt}</p>}

        <TagList tags={tags} />

        <TextLink to={`/works/${slug}`} arrow>
          View work
        </TextLink>
      </div>
    </article>
  );
}