import { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <button
        className="nav-toggle"
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="site-nav"
      >
        Menu
      </button>

      <div id="site-nav" className={`nav-panel ${open ? "open" : ""}`}>
        <ul className="nav-section left">
          <li><Link to="/works">Works</Link></li>
          <li><Link to="/texts">Texts</Link></li>
          <li><Link to="/updates">Updates</Link></li>
        </ul>

      <Link to="/" className="logo">
        UpsetXociety
      </Link>

        <ul className="nav-section right">
          <li><Link to="/about">About</Link></li>
          <li><Link to="/print">Print</Link></li>
          <li><Link to="/vault">Vault</Link></li>
        </ul>
      </div>
    </nav>
  );
}