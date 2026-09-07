import { Link } from "react-router-dom";
import { useStore } from "../lib/store";
import { formatGhs } from "../lib/format";

const programmeArt = [
  "/images/study-desk.png",
  "/images/mentorship.png",
  "/images/tutorial-table.png",
  "/images/hero-focus.png",
];

export function HomePage() {
  const { data, currentUser } = useStore();
  const featured = data.courses.slice(0, 4);

  return (
    <main className="home">
      <section className="editorial-hero">
        <div className="editorial-hero__copy fade-up">
          <p className="eyebrow">Accra | ICAG classes</p>
          <div className="editorial-hero__brand">
            <img src="/logo.png" alt="" />
            <div>
              <strong>Echelon</strong>
              <span>Professional Institute</span>
            </div>
          </div>
          <h1>Building minds. Shaping futures.</h1>
          <p className="lead">
            We help you pass your ICAG exams. After you enrol, you get notes, practice questions,
            and live classes you can book online or in Accra.
          </p>
          <div className="hero-cta">
            {currentUser?.role === "student" ? (
              <Link className="btn btn-primary" to="/learn">
                Go to my classes
              </Link>
            ) : currentUser?.role === "admin" ? (
              <Link className="btn btn-primary" to="/admin">
                Go to admin
              </Link>
            ) : (
              <Link className="btn btn-primary" to="/courses">
                View programmes
              </Link>
            )}
            <Link className="btn btn-ghost" to="/book">
              Book a call
            </Link>
          </div>
        </div>
        <figure className="editorial-hero__media fade-up-delay">
          <img src="/images/faculty.png" alt="Echelon Professional Institute faculty" />
        </figure>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Programmes</p>
            <h2>Our classes</h2>
          </div>
          <div className="course-grid">
            {featured.map((course, i) => (
              <Link key={course.id} to={`/courses/${course.id}`} className="glass course-tile">
                <div className="course-tile__media">
                  <img src={programmeArt[i]} alt="" />
                </div>
                <div className="course-tile__body">
                  <span className="tag">{course.code}</span>
                  <h3>{course.title}</h3>
                  <p className="muted">{course.blurb}</p>
                  <div className="course-tile__meta">
                    <span className="price">{formatGhs(course.priceGhs)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container editorial-cta">
          <figure className="editorial-cta__media">
            <img src="/images/mentorship.png" alt="Tutorial session at Echelon" />
          </figure>
          <div className="glass editorial-cta__panel">
            <p className="eyebrow">Need help choosing?</p>
            <h2>Book a short call first</h2>
            <p className="muted">
              Tell us which paper you want. We will help you choose. Then you can enrol and book
              class times.
            </p>
            <div className="hero-cta">
              <Link className="btn btn-primary" to="/book">
                Book a call
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
