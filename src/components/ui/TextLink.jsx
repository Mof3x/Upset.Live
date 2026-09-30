import { Link } from "react-router-dom";
import "./TextLink.css";

export default function TextLink({
  to,
  href,
  children,
  variant = "default",
  arrow = false,
  external = false,
  className = "",
  onClick,
  ...props
}) {
  const classes = [
    "text-link",
    `text-link--${variant}`,
    arrow ? "text-link--arrow" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <span className="text-link__label">{children}</span>
      {arrow && <span className="text-link__arrow" aria-hidden="true">→</span>}
    </>
  );

  if (external && href) {
    return (
      <a
        href={href}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        {...props}
      >
        {content}
      </a>
    );
  }

  return (
    <Link to={to} className={classes} onClick={onClick} {...props}>
      {content}
    </Link>
  );
}