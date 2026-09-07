import { NavLink, Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useStore } from "../lib/store";
import { IcagTrust } from "./IcagTrust";

export function MarketingLayout() {
  const { currentUser, logout } = useStore();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="site">
      <div className="site-atmosphere" aria-hidden="true" />
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="container">
          <div className="glass glass-nav">
            <Link to="/" className="brand" onClick={close} aria-label="Echelon home">
              <img src="/logo.png" alt="" />
              <div className="brand-text">
                <strong>Echelon</strong>
                <span>Professional Institute</span>
              </div>
            </Link>

            <nav className="nav nav-desktop" aria-label="Primary">
              <NavLink to="/" end onClick={close}>
                Home
              </NavLink>
              <NavLink to="/courses" onClick={close}>
                Programmes
              </NavLink>
              <NavLink to="/book" onClick={close}>
                Book a call
              </NavLink>
              {currentUser?.role === "student" && (
                <NavLink to="/learn" onClick={close}>
                  My classes
                </NavLink>
              )}
              {currentUser?.role === "admin" && (
                <NavLink to="/admin" onClick={close}>
                  Admin
                </NavLink>
              )}
            </nav>

            <div className="nav-actions">
              {currentUser ? (
                <button
                  className="btn btn-ghost nav-actions__desk"
                  type="button"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  Sign out
                </button>
              ) : (
                <>
                  <Link className="btn btn-ghost nav-actions__desk" to="/login">
                    Sign in
                  </Link>
                  <Link className="btn btn-primary nav-actions__desk" to="/signup">
                    Register
                  </Link>
                </>
              )}
              <button
                className={`mobile-nav-toggle ${open ? "is-open" : ""}`}
                type="button"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
              >
                <span />
                <span />
                <span />
              </button>
            </div>
          </div>
        </div>
      </header>

      {open && (
        <div className="mobile-sheet" role="dialog" aria-modal="true" aria-label="Menu">
          <button className="mobile-sheet__backdrop" type="button" aria-label="Close" onClick={close} />
          <div className="mobile-sheet__panel glass">
            <div className="mobile-sheet__head">
              <div>
                <p className="eyebrow">Menu</p>
                <strong className="mobile-sheet__title">Echelon</strong>
              </div>
              <button className="btn btn-ghost" type="button" onClick={close}>
                Close
              </button>
            </div>
            <nav className="mobile-sheet__nav" aria-label="Mobile">
              <NavLink to="/" end onClick={close}>
                Home
              </NavLink>
              <NavLink to="/courses" onClick={close}>
                Programmes
              </NavLink>
              <NavLink to="/book" onClick={close}>
                Book a call
              </NavLink>
              {currentUser?.role === "student" && (
                <NavLink to="/learn" onClick={close}>
                  My classes
                </NavLink>
              )}
              {currentUser?.role === "admin" && (
                <NavLink to="/admin" onClick={close}>
                  Admin
                </NavLink>
              )}
            </nav>
            <div className="mobile-sheet__actions">
              {currentUser ? (
                <button
                  className="btn btn-ink"
                  type="button"
                  onClick={() => {
                    close();
                    logout();
                    navigate("/");
                  }}
                >
                  Sign out
                </button>
              ) : (
                <>
                  <Link className="btn btn-primary" to="/signup" onClick={close}>
                    Register
                  </Link>
                  <Link className="btn btn-ghost" to="/login" onClick={close}>
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <Outlet />

      <footer className="site-footer">
        <div className="container site-footer__inner">
          <div className="site-footer__brand">
            <Link to="/" className="brand site-footer__logo">
              <img src="/logo.png" alt="" width={42} height={42} />
              <div className="brand-text">
                <strong>Echelon Professional Institute</strong>
                <span>Building minds. Shaping futures.</span>
              </div>
            </Link>
            <p className="site-footer__blurb">
              ICAG exam classes in Accra. For people at work and people who just left school.
            </p>
            <IcagTrust compact />
          </div>

          <div className="site-footer__cols">
            <div className="site-footer__col">
              <h4>Go to</h4>
              <nav className="site-footer__links" aria-label="Footer">
                <Link to="/">Home</Link>
                <Link to="/courses">Programmes</Link>
                <Link to="/book">Book a call</Link>
                {currentUser?.role === "student" && <Link to="/learn">My classes</Link>}
              </nav>
            </div>
            <div className="site-footer__col">
              <h4>About us</h4>
              <div className="site-footer__meta">
                <span>Accra, Ghana</span>
                <span>Started in 2026</span>
                <a
                  href="https://www.linkedin.com/company/echelon-professional-institute/"
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="container site-footer__base">
          <p>© {new Date().getFullYear()} Echelon Professional Institute. Demo only.</p>
        </div>
      </footer>
    </div>
  );
}
