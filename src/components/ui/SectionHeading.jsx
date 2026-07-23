import TextLink from "./TextLink";
import "./SectionHeading.css";

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  linkTo,
  linkLabel,
  className = "",
}) {
  return (
    <header className={`section-heading ${className}`.trim()}>
      {eyebrow && <p className="section-heading__eyebrow">{eyebrow}</p>}
      <h2 className="section-heading__title">{title}</h2>
      {subtitle && <p className="section-heading__subtitle">{subtitle}</p>}

      {linkTo && linkLabel && (
        <div className="section-heading__action">
          <TextLink to={linkTo} arrow>
            {linkLabel}
          </TextLink>
        </div>
      )}
    </header>
  );
}