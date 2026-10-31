import { Link } from "react-router-dom";
import { getSiteSettings } from "../../lib/queries";
import { normalizeSiteSettings } from "../../lib/normalise";
import { SECTIONS } from "../../lib/sections";
import useDirectusResource from "../../lib/useDirectusResource";
import "./Footer.css";

// Used until the matching site_settings fields are filled in Directus.
const fallbackSocials = {
  instagram: "https://www.instagram.com/upsetxociety/",
  bandcamp: "https://upsetxociety.bandcamp.com/",
  youtube: "https://www.youtube.com/@upsetxociety",
  email: "hello@upset.live",
};
const fallbackStatement = "An independent haus for image, sound and thought.";

function ExternalLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

export default function Footer() {
  const { data: settings } = useDirectusResource(getSiteSettings, null, normalizeSiteSettings, "site-settings");
  const socials = { ...fallbackSocials };
  Object.entries(settings?.socials || {}).forEach(([key, value]) => {
    if (value) socials[key] = value;
  });
  const email = socials.email.replace(/^mailto:/, "");

  const socialLinks = [
    { label: "Instagram", href: socials.instagram },
    { label: "Bandcamp", href: socials.bandcamp },
    { label: "YouTube", href: socials.youtube },
  ];

  const sectionLinks = SECTIONS.filter((section) => section.key !== "home");
  const supportLinks = [
    { label: "Newsletter", to: "/newsletter" },
    { label: "Bookings and commissions", to: "/commissions" },
    { label: "Print editions", to: "/shop/prints" },
    { label: "Contact", to: "/contact" },
  ];

  // Laid out like the bottom of an old channel site: a navigation band, a row of small links,
  // the small print and the UX stamp.
  return (
    <footer className="site-footer">
      <nav className="site-footer__band" aria-label="Footer">
        <ul>
          {sectionLinks.map((section) => (
            <li key={section.key}>
              <Link to={section.to}>{section.label}</Link>
            </li>
          ))}
        </ul>
        <Link to="/newsletter" className="site-footer__join">
          Join us
        </Link>
      </nav>

      <ul className="site-footer__links">
        {supportLinks.map((link) => (
          <li key={link.to}>
            <Link to={link.to}>{link.label}</Link>
          </li>
        ))}
        {socialLinks.map((link) => (
          <li key={link.label}>
            <ExternalLink href={link.href}>{link.label}</ExternalLink>
          </li>
        ))}
        <li><a href={`mailto:${email}`}>Email</a></li>
      </ul>

      <p className="site-footer__small">
        {settings?.footerStatement || fallbackStatement} © {new Date().getFullYear()} UpsetXociety.
      </p>

      <Link className="site-footer__stamp" to="/" aria-label="UpsetXociety, home">
        <b aria-hidden="true">U</b>
        <b aria-hidden="true">X</b>
      </Link>
    </footer>
  );
}
