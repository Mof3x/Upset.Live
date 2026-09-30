import { Link } from "react-router-dom";
import { getSiteSettings } from "../../lib/queries";
import { normalizeSiteSettings } from "../../lib/normalise";
import useDirectusResource from "../../lib/useDirectusResource";
import "./Footer.css";

// Used until the matching site_settings fields are filled in Directus.
const fallbackSocials = {
  instagram: "https://www.instagram.com/upsetxociety/",
  bandcamp: "https://upsetxociety.bandcamp.com/",
  youtube: "https://www.youtube.com/@upsetxociety",
  email: "hello@upset.live",
};
const fallbackStatement = "An independent house for image, sound and thought.";

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

  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <section>
          <p className="site-footer__label">Navigate</p>
          <ul>
            <li><Link to="/works">Works</Link></li>
            <li><Link to="/texts">Texts</Link></li>
            <li><Link to="/journal">Journal</Link></li>
            <li><Link to="/razz">Razz Magazine</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </section>

        <section>
          <p className="site-footer__label">Follow</p>
          <ul>
            {socialLinks.map((link) => (
              <li key={link.label}>
                <ExternalLink href={link.href}>{link.label}</ExternalLink>
              </li>
            ))}
            <li><a href={`mailto:${email}`}>Email</a></li>
          </ul>
        </section>

        <section>
          <p className="site-footer__label">Support</p>
          <ul>
            <li><Link to="/newsletter">Newsletter</Link></li>
            <li><Link to="/commissions">Bookings and commissions</Link></li>
            <li><Link to="/shop/prints">Print editions</Link></li>
          </ul>
        </section>
      </div>

      <div className="site-footer__closing">
        <Link className="site-footer__logo" to="/">
          UpsetXociety
        </Link>
        <p>{settings?.footerStatement || fallbackStatement}</p>
      </div>
    </footer>
  );
}
