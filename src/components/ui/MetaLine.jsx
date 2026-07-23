import "./MetaLine.css";

export default function MetaLine({ items = [], className = "" }) {
  const filteredItems = items.filter(Boolean);

  if (!filteredItems.length) return null;

  return (
    <p className={`meta-line ${className}`.trim()}>
      {filteredItems.map((item, index) => (
        <span key={index} className="meta-line__item">
          {item}
        </span>
      ))}
    </p>
  );
}