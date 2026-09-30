import { Link } from "react-router-dom";
import MediaFrame from "../ui/MediaFrame";
import MetaLine from "../ui/MetaLine";
import TagList from "../ui/TagList";
import TextLink from "../ui/TextLink";
import "../../pages/CorePages.css";

// Editorial list entry: journal posts, Razz issues and features, disciplines.
export default function EntryCard({
  to,
  title,
  meta = [],
  excerpt,
  tags = [],
  image,
  imageAlt,
  linkLabel = "Read more",
  headingLevel = 2,
}) {
  const Heading = `h${headingLevel}`;

  return (
    <article className={`journal-card ${image ? "journal-card--media" : ""}`.trim()}>
      {image && (
        <Link to={to} className="journal-card__media" aria-label={`Open ${title}`}>
          <MediaFrame ratio="4 / 3">
            <img src={image} alt={imageAlt || title} loading="lazy" />
          </MediaFrame>
        </Link>
      )}
      <div className="journal-card__body">
        <MetaLine items={meta} />
        <Heading>
          <Link to={to}>{title}</Link>
        </Heading>
        {excerpt && <p>{excerpt}</p>}
        <TagList tags={tags} />
        <TextLink to={to} arrow>
          {linkLabel}
        </TextLink>
      </div>
    </article>
  );
}
