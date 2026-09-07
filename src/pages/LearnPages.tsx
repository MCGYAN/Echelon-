import { useEffect, useMemo, useState, type FormEvent, type MouseEvent } from "react";

import { Link, Navigate, useNavigate, useParams } from "react-router-dom";

import { useStore } from "../lib/store";

import { formatWhen } from "../lib/format";



export function LearnHomePage() {

  const { currentUser, data, courseProgress, courseById } = useStore();

  const mine = data.enrolments.filter((e) => e.userId === currentUser?.id);



  return (

    <div>

      <div className="topbar">

        <div>

          <p className="eyebrow">My classes</p>

          <h1 className="display" style={{ fontSize: "2.4rem" }}>

            Hello, {currentUser?.name.split(" ")[0]}.

          </h1>

        </div>

        {mine.length > 0 && (

          <Link className="btn btn-ghost" to="/learn/materials">

            Learning materials

          </Link>

        )}

      </div>



      {mine.length === 0 ? (

        <div className="glass" style={{ padding: "1.5rem" }}>

          <h2 style={{ fontSize: "1.6rem" }}>No class yet</h2>

          <p className="muted" style={{ margin: "0.6rem 0 1rem" }}>

            Enrol first. Then your notes and class times will show here.

          </p>

          <Link className="btn btn-primary" to="/courses">

            View programmes

          </Link>

        </div>

      ) : (

        <div style={{ display: "grid", gap: "1rem" }}>

          {mine.map((enrolment) => {

            const course = courseById(enrolment.courseId);

            if (!course) return null;

            const progress = courseProgress(course.id);

            return (

              <Link

                key={enrolment.id}

                to={`/learn/courses/${course.id}`}

                className="glass"

                style={{ padding: "1.25rem 1.4rem", display: "grid", gap: "0.75rem" }}

              >

                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>

                  <div>

                    <span className="tag">{course.code}</span>

                    <h3 style={{ fontSize: "1.15rem", marginTop: "0.45rem" }}>{course.title}</h3>

                  </div>

                  <strong className="dash-num" style={{ fontSize: "1.8rem" }}>

                    {progress}%

                  </strong>

                </div>

                <div className="progress">

                  <span style={{ width: `${progress}%` }} />

                </div>

                <p className="muted" style={{ fontSize: "0.9rem" }}>

                  Open to continue

                </p>

              </Link>

            );

          })}

        </div>

      )}

    </div>

  );

}



export function LearnSessionsPage() {

  const { currentUser, data, courseById } = useStore();

  const mine = data.bookings

    .filter((b) => b.userId === currentUser?.id)

    .map((b) => ({ booking: b, session: data.sessions.find((s) => s.id === b.sessionId)! }))

    .filter((x) => x.session)

    .sort((a, b) => +new Date(a.session.startsAt) - +new Date(b.session.startsAt));



  return (

    <div>

      <div className="topbar">

        <div>

          <p className="eyebrow">My bookings</p>

          <h1 className="display" style={{ fontSize: "2.2rem" }}>

            Calls and tutorials you booked

          </h1>

        </div>

        <Link className="btn btn-primary" to="/book">

          Book another

        </Link>

      </div>

      {mine.length === 0 ? (

        <div className="glass" style={{ padding: "1.4rem" }}>

          <p className="muted" style={{ marginBottom: "1rem" }}>

            You have no bookings yet.

          </p>

          <Link className="btn btn-primary" to="/book">

            Book a call or tutorial

          </Link>

        </div>

      ) : (

        <div style={{ display: "grid", gap: "0.8rem" }}>

          {mine.map(({ booking, session }) => {

            const course = session.courseId ? courseById(session.courseId) : null;

            return (

              <article key={booking.id} className="glass" style={{ padding: "1.1rem 1.25rem" }}>

                <span className="tag">{session.type === "call" ? "Call" : "Tutorial"}</span>

                <h3 style={{ fontSize: "1.1rem", marginTop: "0.4rem" }}>{session.title}</h3>

                <p className="muted">

                  {formatWhen(session.startsAt)} | {session.mode}

                  {course ? ` | ${course.title}` : ""}

                </p>

              </article>

            );

          })}

        </div>

      )}

    </div>

  );

}



export function LearnCoursePage() {

  const { courseId } = useParams();

  const { courseById, modulesForCourse, isEnrolled, getEnrolment, courseProgress } = useStore();

  const course = courseById(courseId ?? "");



  if (!course) return <p>Programme not found.</p>;

  if (!isEnrolled(course.id)) return <Navigate to={`/courses/${course.id}`} replace />;



  const modules = modulesForCourse(course.id);

  const enrolment = getEnrolment(course.id)!;

  const progress = courseProgress(course.id);



  return (

    <div>

      <div className="topbar">

        <div>

          <p className="eyebrow">{course.code}</p>

          <h1 className="display" style={{ fontSize: "2.2rem" }}>

            {course.title}

          </h1>

        </div>

        <div style={{ minWidth: 140 }}>

          <div className="muted" style={{ fontSize: "0.8rem", marginBottom: 6 }}>

            {progress}% done

          </div>

          <div className="progress">

            <span style={{ width: `${progress}%` }} />

          </div>

        </div>

      </div>



      <div style={{ display: "grid", gap: "0.85rem" }}>

        {modules.map((mod, index) => {

          const done = enrolment.completedModuleIds.includes(mod.id);

          const quizScore = mod.quizId ? enrolment.quizScores[mod.quizId] : undefined;

          return (

            <article key={mod.id} className="glass" style={{ padding: "1.15rem 1.3rem" }}>

              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>

                <div>

                  <div className="muted" style={{ fontSize: "0.78rem", letterSpacing: "0.08em" }}>

                    MODULE {String(index + 1).padStart(2, "0")}

                    {done ? " | DONE" : ""}

                  </div>

                  <h3 style={{ fontSize: "1.1rem", marginTop: "0.25rem" }}>{mod.title}</h3>

                  <p className="muted">{mod.summary}</p>

                  {typeof quizScore === "number" && (

                    <p style={{ marginTop: "0.45rem", color: "var(--gold-deep)", fontWeight: 600 }}>

                      Practice score: {quizScore}%

                    </p>

                  )}

                </div>

                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "start" }}>

                  <Link className="btn btn-primary" to={`/learn/materials/${mod.materialId}`}>

                    Read notes

                  </Link>

                  {mod.quizId && (

                    <Link className="btn btn-ghost" to={`/learn/quizzes/${mod.quizId}`}>

                      Practice

                    </Link>

                  )}

                </div>

              </div>

            </article>

          );

        })}

      </div>

    </div>

  );

}



export function LearnMaterialsPage() {
  const { currentUser, data, courseById } = useStore();
  const enrolledIds = new Set(
    data.enrolments.filter((e) => e.userId === currentUser?.id).map((e) => e.courseId),
  );
  const materials = data.materials
    .filter((m) => enrolledIds.has(m.courseId))
    .sort((a, b) => {
      const ca = courseById(a.courseId)?.title ?? "";
      const cb = courseById(b.courseId)?.title ?? "";
      if (ca !== cb) return ca.localeCompare(cb);
      return a.title.localeCompare(b.title);
    });

  return (
    <div>
      <div className="topbar">
        <div>
          <p className="eyebrow">My classes</p>
          <h1 className="display" style={{ fontSize: "2.2rem" }}>
            Learning materials
          </h1>
          <p className="muted" style={{ marginTop: "0.45rem", maxWidth: "36rem" }}>
            Notes for the classes you enrolled in. Open one to read. Copy and download stay off.
          </p>
        </div>
      </div>

      {materials.length === 0 ? (
        <div className="glass" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1.5rem" }}>No notes yet</h2>
          <p className="muted" style={{ margin: "0.6rem 0 1rem" }}>
            Enrol in a class first. Then your notes will show here.
          </p>
          <Link className="btn btn-primary" to="/courses">
            View programmes
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.85rem" }}>
          {materials.map((material) => {
            const course = courseById(material.courseId);
            return (
              <Link
                key={material.id}
                to={`/learn/materials/${material.id}`}
                className="glass"
                style={{
                  padding: "1.15rem 1.35rem",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "1rem",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <div>
                                    <div className="tag-row" style={{ marginBottom: "0.4rem" }}>
                    <span className="tag">{course?.code ?? "Class"}</span>
                    <span className="tag">{material.kind === "pdf" ? "PDF" : "Notes"}</span>
                    <span className="tag">{material.minutes} min</span>
                  </div>
                  <h3 style={{ fontSize: "1.1rem", margin: 0 }}>{material.title}</h3>
                  <p className="muted" style={{ margin: "0.35rem 0 0", fontSize: "0.9rem" }}>
                    {course?.title}
                  </p>
                </div>
                <span className="btn btn-primary" style={{ pointerEvents: "none" }}>
                  Read notes
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function MaterialPage() {
  const { materialId } = useParams();
  const { materialById, courseById, isEnrolled, markModuleComplete, data, currentUser } = useStore();
  const material = materialById(materialId ?? "");
  const navigate = useNavigate();
  const [pdfSrc, setPdfSrc] = useState("");

  const isPdf = Boolean(material && material.kind === "pdf" && material.fileDataUrl);

  useEffect(() => {
    if (!material?.fileDataUrl || material.kind !== "pdf") {
      setPdfSrc("");
      return;
    }
    let objectUrl = "";
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(material.fileDataUrl!);
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setPdfSrc(`${objectUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`);
      } catch {
        if (!cancelled) {
          setPdfSrc(`${material.fileDataUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`);
        }
      }
    })();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl.split("#")[0]);
    };
  }, [material?.fileDataUrl, material?.kind]);

  if (!material) return <p>Notes not found.</p>;
  if (!isEnrolled(material.courseId)) return <Navigate to={`/courses/${material.courseId}`} replace />;

  const course = courseById(material.courseId);
  const module = data.modules.find((m) => m.materialId === material.id);
  const onContextMenu = (e: MouseEvent) => e.preventDefault();

  return (
    <div>
      <div className="topbar">
        <div>
          <p className="eyebrow">
            {isPdf ? "PDF textbook" : "Notes"} | {material.minutes} min
          </p>
          <h1 className="display" style={{ fontSize: "2rem" }}>
            {material.title}
          </h1>
          <p className="muted">{course?.title}</p>
        </div>
        <button
          className="btn btn-ghost"
          type="button"
          onClick={() => navigate(`/learn/courses/${material.courseId}`)}
        >
          Back to modules
        </button>
      </div>

      <div className="alert" style={{ marginBottom: "1rem" }}>
        On-screen only. Copy and download are off. Watermark: {currentUser?.email}
      </div>

      {isPdf ? (
        <div
          className="glass pdf-viewer watermark"
          data-mark={`${currentUser?.email} | Echelon`}
          onContextMenu={onContextMenu}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
        >
          {pdfSrc ? (
            <iframe title={material.title} src={pdfSrc} className="pdf-viewer__frame" />
          ) : (
            <p className="muted" style={{ padding: "1.5rem" }}>
              Opening PDF...
            </p>
          )}
          <div className="pdf-viewer__shield" aria-hidden="true" />
        </div>
      ) : (
        <article
          className="glass material-view watermark"
          data-mark={`${currentUser?.email} | Echelon`}
          style={{ padding: "1.6rem 1.5rem", position: "relative" }}
          onContextMenu={onContextMenu}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
        >
          {material.body.map((para) => (
            <p key={para.slice(0, 24)}>{para}</p>
          ))}
        </article>
      )}

      {module && (
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => {
              markModuleComplete(material.courseId, module.id);
              navigate(`/learn/courses/${material.courseId}`);
            }}
          >
            Mark as done
          </button>
          {module.quizId && (
            <Link className="btn btn-ghost" to={`/learn/quizzes/${module.quizId}`}>
              Do practice
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export function QuizPage() {

  const { quizId } = useParams();

  const { quizById, isEnrolled, saveQuizScore, courseById } = useStore();

  const quiz = quizById(quizId ?? "");

  const [answers, setAnswers] = useState<Record<string, number>>({});

  const [submitted, setSubmitted] = useState(false);

  const navigate = useNavigate();



  const score = useMemo(() => {

    if (!quiz) return 0;

    let correct = 0;

    quiz.questions.forEach((q) => {

      if (answers[q.id] === q.answerIndex) correct += 1;

    });

    return Math.round((correct / quiz.questions.length) * 100);

  }, [answers, quiz]);



  if (!quiz) return <p>Practice not found.</p>;

  if (!isEnrolled(quiz.courseId)) return <Navigate to={`/courses/${quiz.courseId}`} replace />;



  const course = courseById(quiz.courseId);



  const onSubmit = (e: FormEvent) => {

    e.preventDefault();

    if (Object.keys(answers).length < quiz.questions.length) return;

    saveQuizScore(quiz.courseId, quiz.id, score);

    setSubmitted(true);

  };



  return (

    <div>

      <div className="topbar">

        <div>

          <p className="eyebrow">{course?.code} | Practice</p>

          <h1 className="display" style={{ fontSize: "2rem" }}>

            {quiz.title}

          </h1>

        </div>

        <button className="btn btn-ghost" type="button" onClick={() => navigate(`/learn/courses/${quiz.courseId}`)}>

          Back to modules

        </button>

      </div>



      {submitted ? (

        <div className="glass" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>

          <h2 style={{ fontSize: "1.8rem" }}>Your score: {score}%</h2>

          <p className="muted">Saved. Go back to the notes if you need to revise.</p>

          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>

            <button

              className="btn btn-primary"

              type="button"

              onClick={() => navigate(`/learn/courses/${quiz.courseId}`)}

            >

              Back to modules

            </button>

            <button

              className="btn btn-ghost"

              type="button"

              onClick={() => {

                setSubmitted(false);

                setAnswers({});

              }}

            >

              Try again

            </button>

          </div>

        </div>

      ) : (

        <form className="glass" style={{ padding: "1.4rem", display: "grid", gap: "1.4rem" }} onSubmit={onSubmit}>

          {quiz.questions.map((q, idx) => (

            <fieldset key={q.id} style={{ border: 0, padding: 0, margin: 0 }}>

              <legend style={{ fontWeight: 600, marginBottom: "0.7rem" }}>

                {idx + 1}. {q.prompt}

              </legend>

              <div style={{ display: "grid", gap: "0.45rem" }}>

                {q.options.map((opt, optIdx) => (

                  <label

                    key={opt}

                    style={{

                      display: "flex",

                      gap: "0.65rem",

                      alignItems: "flex-start",

                      padding: "0.7rem 0.85rem",

                      borderRadius: 12,

                      border: "1px solid var(--line)",

                      background: "#fff",

                      cursor: "pointer",

                    }}

                  >

                    <input

                      type="radio"

                      name={q.id}

                      checked={answers[q.id] === optIdx}

                      onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}

                      required

                    />

                    <span>{opt}</span>

                  </label>

                ))}

              </div>

            </fieldset>

          ))}

          <button className="btn btn-primary" type="submit">

            Submit answers

          </button>

        </form>

      )}

    </div>

  );

}

