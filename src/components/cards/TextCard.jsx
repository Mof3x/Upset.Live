import { Link } from "react-router-dom";
import MetaLine from "../ui/MetaLine";
import TagList from "../ui/TagList";
import TextLink from "../ui/TextLink";
import "./TextCard.css";

export default function TextCard({
  slug,
  title,
  type,
  category,
  year,
  excerpt,
  author,
  tags = [],
}) {
  return (
    <article className="text-card">
      <div className="text-card__body">
        <MetaLine items={[type, category, year]} />

        <h3 className="text-card__title">
          <Link to={`/texts/${slug}`}>{title}</Link>
        </h3>

        {author && (
          <p className="text-card__author">
            By <Link to={`/artists/${author.slug}`}>{author.name}</Link>
          </p>
        )}

        {excerpt && <p className="text-card__excerpt">{excerpt}</p>}

        <TagList tags={tags} />

        <TextLink to={`/texts/${slug}`} arrow>
          Read text
        </TextLink>
      </div>
    </article>
  );
}