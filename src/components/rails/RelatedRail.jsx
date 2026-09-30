import TextLink from "../ui/TextLink";
import "../../pages/CorePages.css";

// A labelled group of editorial links. Renders nothing when every group is empty.
export default function RelatedRail({ title = "Continue through the archive", groups = [] }) {
  const filled = groups.filter((group) => group.items?.length);
  if (!filled.length) return null;

  return (
    <section className="related-content" aria-label={title}>
      <h2>{title}</h2>
      {filled.map((group) => (
        <div className="related-content__group" key={group.label}>
          <p className="category-nav__label">{group.label}</p>
          <div className="related-content__links">
            {group.items.map((item) => (
              <TextLink key={item.to} to={item.to} arrow>
                {item.label}
              </TextLink>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
