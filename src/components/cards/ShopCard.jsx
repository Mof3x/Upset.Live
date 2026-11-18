import { Link } from "react-router-dom";
import MediaFrame from "../ui/MediaFrame";
import TextLink from "../ui/TextLink";
import "./WorkCard.css";
import { recordPath } from "../../lib/paths";

// A shop in the /shops list: banner (when there is one), name, who runs it, and its intro.
export default function ShopCard({ to, name, banner, bannerAlt, artist, isHouse, excerpt }) {
  return (
    <article className="work-card">
      {banner && (
        <Link to={to} className="work-card__image-link" aria-label={`Visit ${name}`}>
          <MediaFrame ratio="3 / 2">
            <img src={banner} alt={bannerAlt || name} loading="lazy" />
          </MediaFrame>
        </Link>
      )}

      <div className="work-card__body">
        <h3 className="work-card__title">
          <Link to={to}>{name}</Link>
        </h3>
        {artist ? (
          <p className="work-card__artist">
            Run by <Link to={recordPath("/artists", artist.slug)}>{artist.name}</Link>
          </p>
        ) : (
          isHouse && <p className="work-card__artist">The collective's own shop</p>
        )}
        {excerpt && <p className="work-card__excerpt">{excerpt}</p>}
        <TextLink to={to} arrow>
          Visit the shop
        </TextLink>
      </div>
    </article>
  );
}
