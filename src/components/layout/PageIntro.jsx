import MetaLine from "../ui/MetaLine";
import "../../pages/CorePages.css";

export function PageIntro({ eyebrow, title, description, children }) {
  return (
    <header className="core-page__intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
      {children}
    </header>
  );
}

export function DetailHeader({ eyebrow, title, items = [] }) {
  return (
    <header className="core-detail__header">
      <MetaLine items={[eyebrow, ...items]} />
      <h1>{title}</h1>
    </header>
  );
}
