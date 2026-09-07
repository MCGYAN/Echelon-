import { NavLink, Outlet, Navigate, Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, type ReactNode } from "react";
import { useStore } from "../lib/store";

function AppMoreSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="mobile-sheet mobile-sheet--app" role="dialog" aria-modal="true" aria-label={title}>
      <button className="mobile-sheet__backdrop" type="button" aria-label="Close" onClick={onClose} />
      <div className="mobile-sheet__panel glass">
        <div className="mobile-sheet__head">
          <div>
            <p className="eyebrow">More</p>
            <strong className="mobile-sheet__title">{title}</strong>
          </div>
          <button className="btn btn-ghost" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="mobile-sheet__nav">{children}</div>
      </div>
    </div>
  );
}

export function LearnLayout() {
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

  if (!currentUser) return <Navigate to="/login" replace state={{ from: "/learn" }} />;
  if (currentUser.role === "admin") return <Navigate to="/admin" replace />;

  const signOut = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="app-shell">
      <header className="app-mobile-bar">
        <Link to="/" className="app-mobile-bar__brand" aria-label="Back to home">
          <img src="/logo.png" alt="" />
          <div>
            <strong>Echelon</strong>
            <span>My classes</span>
          </div>
        </Link>
        <button
          type="button"
          className={`mobile-nav-toggle ${moreOpen ? "is-open" : ""}`}
          aria-label={moreOpen ? "Close menu" : "Open menu"}
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <aside className="side">
        <Link to="/" className="side-brand" aria-label="Back to home">
          <img src="/logo.png" alt="" />
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.25rem" }}>Echelon</div>
            <div style={{ fontSize: "0.72rem", opacity: 0.7, fontWeight: 500 }}>My classes</div>
          </div>
        </Link>
        <nav>
          <NavLink to="/learn" end>
            My programmes
          </NavLink>
          <NavLink to="/learn/materials" end>
            Learning materials
          </NavLink>
          <NavLink to="/learn/sessions">My bookings</NavLink>
          <NavLink to="/book">Book a call or tutorial</NavLink>
          <NavLink to="/courses">Find a programme</NavLink>
          <NavLink to="/">Home</NavLink>
        </nav>
        <div style={{ marginTop: "auto", display: "grid", gap: "0.55rem", padding: "0.5rem" }}>
          <p style={{ fontSize: "0.78rem", opacity: 0.55, margin: 0 }}>{currentUser.name}</p>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ color: "#f3efe6", borderColor: "rgba(255,255,255,0.2)" }}
            onClick={signOut}
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="main-pane">
        <Outlet />
      </div>

      <nav className="app-bottom-nav" aria-label="Student">
        <NavLink to="/learn" end>
          <span className="app-bottom-nav__icon" aria-hidden="true" />
          Classes
        </NavLink>
        <NavLink to="/learn/materials" end>
          <span className="app-bottom-nav__icon" aria-hidden="true" />
          Notes
        </NavLink>
        <NavLink to="/learn/sessions">
          <span className="app-bottom-nav__icon" aria-hidden="true" />
          Bookings
        </NavLink>
        <button
          type="button"
          className={`app-bottom-nav__more ${moreOpen ? "is-active" : ""}`}
          onClick={() => setMoreOpen(true)}
        >
          <span className="app-bottom-nav__icon" aria-hidden="true" />
          More
        </button>
      </nav>

      <AppMoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} title="My classes">
        <Link to="/book" onClick={() => setMoreOpen(false)}>
          Book a call or tutorial
        </Link>
        <Link to="/courses" onClick={() => setMoreOpen(false)}>
          Find a programme
        </Link>
        <Link to="/" onClick={() => setMoreOpen(false)}>
          Home
        </Link>
        <p className="mobile-sheet__meta">{currentUser.name}</p>
        <button className="btn btn-ink" type="button" onClick={signOut}>
          Sign out
        </button>
      </AppMoreSheet>
    </div>
  );
}

export function AdminLayout() {
  const { currentUser, resetDemo, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

  if (!currentUser) return <Navigate to="/login" replace state={{ from: "/admin" }} />;
  if (currentUser.role !== "admin") return <Navigate to="/learn" replace />;

  const signOut = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="app-shell">
      <header className="app-mobile-bar">
        <Link to="/" className="app-mobile-bar__brand" aria-label="Back to home">
          <img src="/logo.png" alt="" />
          <div>
            <strong>Echelon</strong>
            <span>Admin</span>
          </div>
        </Link>
        <button
          type="button"
          className={`mobile-nav-toggle ${moreOpen ? "is-open" : ""}`}
          aria-label={moreOpen ? "Close menu" : "Open menu"}
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <aside className="side">
        <Link to="/" className="side-brand" aria-label="Back to home">
          <img src="/logo.png" alt="" />
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.25rem" }}>Echelon</div>
            <div style={{ fontSize: "0.72rem", opacity: 0.7, fontWeight: 500 }}>Admin</div>
          </div>
        </Link>
        <nav>
          <NavLink to="/admin" end>
            Dashboard
          </NavLink>
          <NavLink to="/admin/students">Students</NavLink>
          <NavLink to="/admin/sessions">Timetable</NavLink>
          <NavLink to="/admin/content">Notes and files</NavLink>
          <NavLink to="/admin/courses">Fees</NavLink>
          <NavLink to="/">Home</NavLink>
        </nav>
        <div style={{ marginTop: "auto", display: "grid", gap: "0.55rem" }}>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ color: "#f3efe6", borderColor: "rgba(255,255,255,0.2)" }}
            onClick={() => {
              if (confirm("Reset demo data?")) resetDemo();
            }}
          >
            Reset demo
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ color: "#f3efe6", borderColor: "rgba(255,255,255,0.2)" }}
            onClick={signOut}
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="main-pane">
        <Outlet />
      </div>

      <nav className="app-bottom-nav" aria-label="Admin">
        <NavLink to="/admin" end>
          <span className="app-bottom-nav__icon" aria-hidden="true" />
          Home
        </NavLink>
        <NavLink to="/admin/students">
          <span className="app-bottom-nav__icon" aria-hidden="true" />
          Students
        </NavLink>
        <NavLink to="/admin/sessions">
          <span className="app-bottom-nav__icon" aria-hidden="true" />
          Timetable
        </NavLink>
        <button
          type="button"
          className={`app-bottom-nav__more ${moreOpen ? "is-active" : ""}`}
          onClick={() => setMoreOpen(true)}
        >
          <span className="app-bottom-nav__icon" aria-hidden="true" />
          More
        </button>
      </nav>

      <AppMoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} title="Admin">
        <Link to="/admin/content" onClick={() => setMoreOpen(false)}>
          Notes and files
        </Link>
        <Link to="/admin/courses" onClick={() => setMoreOpen(false)}>
          Fees
        </Link>
        <Link to="/" onClick={() => setMoreOpen(false)}>
          Site home
        </Link>
        <button
          className="btn btn-ghost"
          type="button"
          onClick={() => {
            if (confirm("Reset demo data?")) resetDemo();
          }}
        >
          Reset demo
        </button>
        <button className="btn btn-ink" type="button" onClick={signOut}>
          Sign out
        </button>
      </AppMoreSheet>
    </div>
  );
}
