// Renders text paragraphs produced by bodyToParagraphs(). Never renders HTML.
export default function Prose({ paragraphs = [], className = "core-detail__article", fallback, children }) {
  return (
    <div className={className}>
      {paragraphs.length
        ? paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
        : fallback && <p className="core-detail__placeholder">{fallback}</p>}
      {children}
    </div>
  );
}
