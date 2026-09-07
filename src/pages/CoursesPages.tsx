import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { useStore } from "../lib/store";
import { formatGhs } from "../lib/format";
import { IcagTrust } from "../components/IcagTrust";

const art = [
  "/images/study-desk.png",
  "/images/mentorship.png",
  "/images/tutorial-table.png",
  "/images/hero-focus.png",
];

export function CoursesPage() {
  const { data } = useStore();
  return (
    <main className="page">
      <header className="page-intro glass">
        <p className="eyebrow">Programmes</p>
        <h1 className="display">Classes and fees</h1>
        <p className="muted page-intro__lead">
          Click a class to see what you will learn and how much it costs. After you enrol, your
          notes show in My classes.
        </p>
        <IcagTrust />
      </header>

      <div className="container">
        <div className="course-grid">
          {data.courses.map((course, i) => (
            <Link key={course.id} to={`/courses/${course.id}`} className="glass course-tile">
              <div className="course-tile__media">
                <img src={art[i % art.length]} alt="" />
              </div>
              <div className="course-tile__body">
                <span className="tag">{course.level}</span>
                <h3>{course.title}</h3>
                <p className="muted">{course.blurb}</p>
                <div className="price">{formatGhs(course.priceGhs)}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

export function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { data, courseById, modulesForCourse, currentUser, isEnrolled, enrol } = useStore();
  const [paid, setPaid] = useState(false);
  const course = courseById(courseId ?? "");
  const index = Math.max(0, data.courses.findIndex((c) => c.id === courseId));

  if (!course) {
    return (
      <main className="page">
        <div className="container">
          <div className="glass page-intro">
            <h1 className="display">Class not found</h1>
            <Link className="btn btn-ghost" to="/courses" style={{ marginTop: "1rem", width: "fit-content" }}>
              Back to programmes
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const modules = modulesForCourse(course.id);
  const enrolled = isEnrolled(course.id);

  const handleEnrol = () => {
    if (!currentUser) {
      navigate("/login", { state: { from: `/courses/${course.id}` } });
      return;
    }
    if (currentUser.role !== "student") {
      navigate("/admin");
      return;
    }
    setPaid(true);
    window.setTimeout(() => {
      enrol(course.id);
      navigate(`/learn/courses/${course.id}`);
    }, 700);
  };

  return (
    <main className="page">
      <div className="container detail-layout">
        <figure className="detail-layout__media">
          <img src={art[index % art.length]} alt="" />
        </figure>
        <div className="detail-layout__copy">
          <p className="eyebrow">{course.code}</p>
          <h1 className="display">{course.title}</h1>
          <p className="muted detail-layout__blurb">{course.blurb}</p>
          <p>
            <strong style={{ fontWeight: 600 }}>Who this is for.</strong>{" "}
            <span className="muted">{course.audience}</span>
          </p>

          <h2 className="detail-layout__h2">What you will learn</h2>
          <ul className="list-clean">
            {course.outcomes.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>

          <h2 className="detail-layout__h2">Lessons</h2>
          <ol className="path-list">
            {modules.map((m) => (
              <li key={m.id}>
                <strong>{m.title}</strong>
                <span className="muted">{m.summary}</span>
              </li>
            ))}
          </ol>
        </div>
        <aside className="glass detail-layout__aside">
          <div>
            <div className="eyebrow">Fee</div>
            <div className="price" style={{ fontSize: "1.8rem", marginTop: "0.35rem" }}>
              {formatGhs(course.priceGhs)}
            </div>
          </div>
          <p className="muted" style={{ fontSize: "0.9rem" }}>
            Demo only. No real payment.
          </p>
          {enrolled ? (
            <Link className="btn btn-primary" to={`/learn/courses/${course.id}`}>
              Open my classes
            </Link>
          ) : (
            <button className="btn btn-primary" type="button" onClick={handleEnrol} disabled={paid}>
              {paid ? "Enrolling..." : "Enrol now"}
            </button>
          )}
          <Link className="btn btn-ghost" to="/book">
            Book a call
          </Link>
        </aside>
      </div>
    </main>
  );
}
