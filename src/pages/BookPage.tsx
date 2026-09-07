import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";
import { formatWhen } from "../lib/format";
import type { SessionType } from "../lib/types";

export function BookPage() {
  const { data, currentUser, bookSession, isBooked, sessionSeatsLeft, courseById } = useStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<SessionType | "all">("all");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sessions = useMemo(() => {
    return [...data.sessions]
      .filter((s) => filter === "all" || s.type === filter)
      .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));
  }, [data.sessions, filter]);

  const onBook = (sessionId: string) => {
    setMessage(null);
    setError(null);
    if (!currentUser) {
      navigate("/login", { state: { from: "/book" } });
      return;
    }
    const res = bookSession(sessionId);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setMessage("Booked. See it under My bookings.");
  };

  return (
    <main className="page">
      <header className="page-intro glass">
        <p className="eyebrow">Bookings</p>
        <h1 className="display">Book a call or class</h1>
        <p className="muted page-intro__lead">
          Book a call if you need help choosing a paper. Book a tutorial only after you enrol in
          that class.
        </p>
      </header>

      <div className="container">
        <div className="filter-row">
          {(
            [
              ["all", "Show all"],
              ["call", "Calls only"],
              ["tutorial", "Tutorials only"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`btn ${filter === key ? "btn-ink" : "btn-ghost"}`}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {message && <div className="alert ok" style={{ marginBottom: "1rem" }}>{message}</div>}
        {error && <div className="alert error" style={{ marginBottom: "1rem" }}>{error}</div>}

        <div className="stack">
          {sessions.map((session) => {
            const seats = sessionSeatsLeft(session.id);
            const booked = isBooked(session.id);
            const course = session.courseId ? courseById(session.courseId) : null;
            return (
              <article key={session.id} className="glass session-row">
                <div>
                  <div className="tag-row">
                    <span className="tag">{session.type === "call" ? "Call" : "Tutorial"}</span>
                    <span className="tag">{session.mode}</span>
                  </div>
                  <h3>{session.title}</h3>
                  <p className="muted">
                    {formatWhen(session.startsAt)} | {session.durationMin} min
                    {course ? ` | ${course.code}` : ""}
                    {session.notes ? ` | ${session.notes}` : ""}
                  </p>
                  <p className="muted" style={{ fontSize: "0.85rem", marginTop: "0.35rem" }}>
                    {seats} seat{seats === 1 ? "" : "s"} left
                  </p>
                </div>
                <div>
                  {booked ? (
                    <Link className="btn btn-ghost" to="/learn/sessions">
                      View booking
                    </Link>
                  ) : (
                    <button
                      className="btn btn-primary"
                      type="button"
                      disabled={seats <= 0}
                      onClick={() => onBook(session.id)}
                    >
                      {seats <= 0 ? "Full" : session.type === "call" ? "Book this call" : "Book this tutorial"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
