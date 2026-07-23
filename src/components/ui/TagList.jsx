import "./TagList.css";

export default function TagList({ tags = [], className = "" }) {
  const filteredTags = tags.filter(Boolean);

  if (!filteredTags.length) return null;

  return (
    <ul className={`tag-list ${className}`.trim()}>
      {filteredTags.map((tag, index) => (
        <li key={index} className="tag-list__item">
          {typeof tag === "string" ? tag : tag.label}
        </li>
      ))}
    </ul>
  );
}