import { Link } from "react-router-dom";
import MediaFrame from "../ui/MediaFrame";
import MetaLine from "../ui/MetaLine";
import TextLink from "../ui/TextLink";
import "./WorkCard.css";
import { recordPath } from "../../lib/paths";

const statusLabel = { available: "Open", archived: "Archived" };

export default function VaultItemCard({
  slug,
  title,
  image,
  imageAlt,
  category,
  edition,
  status,
  priceLabel,
  soldOut,
  excerpt,
  artists = [],
  basePath = "/vault",
}) {
  const to = recordPath(basePath, slug);
  // The last item on the meta line: "Sold out" or "Archived" first, then the price, then "Open".
  const availability = soldOut ? "Sold out" : status === "archived" ? statusLabel.archived : priceLabel || statusLabel[status];

  return (
    <article className="work-card">
      {image && (
        <Link to={to} className="work-card__image-link" aria-label={`View ${title}`}>
          <MediaFrame ratio="4 / 5">
            <img src={image} alt={imageAlt || title} loading="lazy" />
          </MediaFrame>
        </Link>
      )}

      <div className="work-card__body">
        <MetaLine items={[category, edition, availability]} />

        <h3 className="work-card__title">
          <Link to={to}>{title}</Link>
        </h3>

        {artists.length > 0 && (
          <p className="work-card__artist">
            {artists.map((artist, index) => (
              <span key={artist.slug || index}>
                {index > 0 && ", "}
                {artist.slug ? <Link to={recordPath("/artists", artist.slug)}>{artist.name}</Link> : artist.name}
              </span>
            ))}
          </p>
        )}

        {excerpt && <p className="work-card__excerpt">{excerpt}</p>}

        <TextLink to={to} arrow>
          Learn more about this edition
        </TextLink>
      </div>
    </article>
  );
}
