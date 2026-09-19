import { Link } from "react-router-dom";
import "./Footer.css";

const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/upsetxociety/" },
  { label: "Bandcamp", href: "https://upsetxociety.bandcamp.com/" },
  { label: "YouTube", href: "https://www.youtube.com/@upsetxociety" },
  { label: "Email", href: "mailto:hello@upset.live" },
];

function ExternalLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <section>
          <p className="site-footer__label">Navigate</p>
          <ul>
            <li><Link to="/works">Works</Link></li>
            <li><Link to="/texts">Texts</Link></li>
            <li><Link to="/journal">Journal</Link></li>
            <li><Link to="/artists">Artists</Link></li>
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
          </ul>
        </section>

        <section>
          <p className="site-footer__label">Support</p>
          <ul>
            <li><Link to="/contact">Bookings and commissions</Link></li>
            <li><Link to="/vault">Vault enquiries</Link></li>
            <li><Link to="/contact">Newsletter</Link></li>
          </ul>
        </section>
      </div>

      <div className="site-footer__closing">
        <Link className="site-footer__logo" to="/">
          UpsetXociety
        </Link>
        <p>An independent house for image, sound and thought.</p>
      </div>
    </footer>
  );
}
