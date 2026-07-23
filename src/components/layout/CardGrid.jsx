import "./CardGrid.css";

export default function CardGrid({
  children,
  min = "180px",
  className = "",
}) {
  return (
    <div
      className={`card-grid ${className}`.trim()}
      style={{ "--card-grid-min": min }}
    >
      {children}
    </div>
  );
}