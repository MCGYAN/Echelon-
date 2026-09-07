import { useMemo, useState, type FormEvent, type ChangeEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../lib/store";
import { formatGhs, formatWhen } from "../lib/format";
import type { SessionType } from "../lib/types";

const MAX_PDF_BYTES = 1.8 * 1024 * 1024;

function readPdfAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

function AdminHero({
  eyebrow,
  title,
  lead,
  action,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  action?: ReactNode;
}) {
  return (
    <header className="admin-hero glass">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display admin-hero__title">{title}</h1>
        <p className="muted admin-hero__lead">{lead}</p>
      </div>
      {action}
    </header>
  );
}

export function AdminDashboard() {
  const { data, courseProgress, courseById } = useStore();
  const students = data.users.filter((u) => u.role === "student");
  const upcoming = [...data.sessions]
    .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt))
    .slice(0, 4);
  const pdfCount = data.materials.filter((m) => m.kind === "pdf").length;

  return (
    <div className="admin-page">
      <AdminHero
        eyebrow="Admin"
        title="Dashboard"
        lead="See students, enrolments, and the next sessions at a glance."
        action={
          <Link className="btn btn-primary" to="/admin/content">
            Upload materials
          </Link>
        }
      />

      <div className="stat-row">
        <div className="glass stat">
          <span className="muted">Students</span>
          <strong className="dash-num">{students.length}</strong>
        </div>
        <div className="glass stat">
          <span className="muted">Enrolments</span>
          <strong className="dash-num">{data.enrolments.length}</strong>
        </div>
        <div className="glass stat">
          <span className="muted">Sessions</span>
          <strong className="dash-num">{data.sessions.length}</strong>
        </div>
        <div className="glass stat">
          <span className="muted">PDF files</span>
          <strong className="dash-num">{pdfCount}</strong>
        </div>
      </div>

      <div className="split">
        <section className="glass admin-panel">
          <div className="admin-panel__head">
            <p className="eyebrow">Progress</p>
            <h2>Student progress</h2>
          </div>
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Programme</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {data.enrolments.map((e) => {
                  const user = data.users.find((u) => u.id === e.userId);
                  const course = courseById(e.courseId);
                  return (
                    <tr key={e.id}>
                      <td>{user?.name}</td>
                      <td>{course?.code}</td>
                      <td>
                        <div className="admin-progress">
                          <div className="progress">
                            <span style={{ width: `${courseProgress(e.courseId, e.userId)}%` }} />
                          </div>
                          <strong>{courseProgress(e.courseId, e.userId)}%</strong>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="glass admin-panel">
          <div className="admin-panel__head">
            <p className="eyebrow">Timetable</p>
            <h2>Upcoming sessions</h2>
          </div>
          <div className="admin-session-list">
            {upcoming.map((s) => (
              <article key={s.id} className="admin-session-card">
                <div className="tag-row">
                  <span className="tag">{s.type === "call" ? "Call" : "Tutorial"}</span>
                  <span className="tag">{s.mode}</span>
                </div>
                <strong>{s.title}</strong>
                <p className="muted">
                  {formatWhen(s.startsAt)} | {data.bookings.filter((b) => b.sessionId === s.id).length}/
                  {s.capacity} booked
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function AdminStudents() {
  const { data, courseById, courseProgress } = useStore();
  const students = data.users.filter((u) => u.role === "student");

  return (
    <div className="admin-page">
      <AdminHero
        eyebrow="People"
        title="Students"
        lead="Who is enrolled, and how far they have got in each class."
      />
      <section className="glass admin-panel">
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Enrolments</th>
                <th>Practice scores</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const enrolments = data.enrolments.filter((e) => e.userId === student.id);
                return (
                  <tr key={student.id}>
                    <td>
                      <strong>{student.name}</strong>
                    </td>
                    <td>{student.email}</td>
                    <td>
                      {enrolments.length === 0
                        ? "None yet"
                        : enrolments
                            .map((e) => {
                              const c = courseById(e.courseId);
                              return `${c?.code ?? "?"} (${courseProgress(e.courseId, student.id)}%)`;
                            })
                            .join(", ")}
                    </td>
                    <td>
                      {enrolments
                        .flatMap((e) =>
                          Object.entries(e.quizScores).map(([qid, score]) => {
                            const quiz = data.quizzes.find((q) => q.id === qid);
                            return `${quiz?.title ?? qid}: ${score}%`;
                          }),
                        )
                        .join(" | ") || "No try-sets yet"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export function AdminSessions() {
  const { data, addSession, bookingsForSession, courseById } = useStore();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<SessionType>("tutorial");
  const [courseId, setCourseId] = useState(data.courses[0]?.id ?? "");
  const [startsAt, setStartsAt] = useState("");
  const [durationMin, setDurationMin] = useState(90);
  const [capacity, setCapacity] = useState(10);
  const [mode, setMode] = useState<"Online" | "Accra campus">("Online");
  const [ok, setOk] = useState("");

  const sessions = useMemo(
    () => [...data.sessions].sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt)),
    [data.sessions],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!startsAt || !title) return;
    addSession({
      title,
      type,
      courseId: type === "call" ? null : courseId,
      startsAt: new Date(startsAt).toISOString(),
      durationMin,
      capacity,
      mode,
    });
    setTitle("");
    setStartsAt("");
    setOk("Session added to the timetable.");
  };

  return (
    <div className="admin-page">
      <AdminHero
        eyebrow="Timetable"
        title="Sessions"
        lead="Add calls and tutorials. Students book them from the site."
      />

      <div className="split">
        <form className="glass admin-panel admin-form" onSubmit={onSubmit}>
          <div className="admin-panel__head">
            <p className="eyebrow">New</p>
            <h2>Add session</h2>
          </div>
          {ok && <div className="alert ok">{ok}</div>}
          <div className="field">
            <label>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="field">
            <label>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as SessionType)}>
              <option value="tutorial">Tutorial</option>
              <option value="call">Prospect call</option>
            </select>
          </div>
          {type === "tutorial" && (
            <div className="field">
              <label>Programme</label>
              <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                {data.courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}: {c.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="field">
            <label>Starts</label>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Duration (minutes)</label>
            <input
              type="number"
              min={15}
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value))}
            />
          </div>
          <div className="field">
            <label>Capacity</label>
            <input
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
            />
          </div>
          <div className="field">
            <label>Mode</label>
            <select value={mode} onChange={(e) => setMode(e.target.value as "Online" | "Accra campus")}>
              <option>Online</option>
              <option>Accra campus</option>
            </select>
          </div>
          <button className="btn btn-primary" type="submit">
            Add session
          </button>
        </form>

        <section className="glass admin-panel">
          <div className="admin-panel__head">
            <p className="eyebrow">List</p>
            <h2>Timetable</h2>
          </div>
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Session</th>
                  <th>Seats</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id}>
                    <td>{formatWhen(s.startsAt)}</td>
                    <td>
                      {s.title}
                      <div className="muted" style={{ fontSize: "0.82rem" }}>
                        {s.type}
                        {s.courseId ? ` | ${courseById(s.courseId)?.code}` : ""} | {s.mode}
                      </div>
                    </td>
                    <td>
                      {bookingsForSession(s.id).length}/{s.capacity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export function AdminContent() {
  const { data, addMaterial, addQuiz, courseById } = useStore();
  const [courseId, setCourseId] = useState(data.courses[0]?.id ?? "");
  const [matMode, setMatMode] = useState<"notes" | "pdf">("pdf");
  const [matTitle, setMatTitle] = useState("");
  const [minutes, setMinutes] = useState(20);
  const [body, setBody] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [options, setOptions] = useState("Option A\nOption B\nOption C");
  const [answerIndex, setAnswerIndex] = useState(0);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const materials = [...data.materials].reverse();

  const onPickPdf = (e: ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setPdfFile(null);
      return;
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please choose a PDF file.");
      setPdfFile(null);
      e.target.value = "";
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setError("For this demo, keep PDFs under about 1.8 MB.");
      setPdfFile(null);
      e.target.value = "";
      return;
    }
    setPdfFile(file);
    if (!matTitle.trim()) {
      setMatTitle(file.name.replace(/\.pdf$/i, ""));
    }
  };

  const onSaveMaterial = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setNote("");

    if (matMode === "notes") {
      if (!body.trim()) {
        setError("Add some note text first.");
        return;
      }
      addMaterial({ courseId, title: matTitle, minutes, body, kind: "notes" });
      setMatTitle("");
      setBody("");
      setNote("Notes saved. Students in this class can read them now.");
      return;
    }

    if (!pdfFile) {
      setError("Choose a PDF to upload.");
      return;
    }

    try {
      setPdfBusy(true);
      const fileDataUrl = await readPdfAsDataUrl(pdfFile);
      addMaterial({
        courseId,
        title: matTitle || pdfFile.name.replace(/\.pdf$/i, ""),
        minutes,
        kind: "pdf",
        fileName: pdfFile.name,
        fileDataUrl,
      });
      setMatTitle("");
      setPdfFile(null);
      setNote("PDF saved. Students can open it on screen. Download and copy stay off.");
    } catch {
      setError("Could not read that PDF. Try another file.");
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <div className="admin-page">
      <AdminHero
        eyebrow="Curriculum"
        title="Notes and files"
        lead="Add text notes or upload a PDF textbook. Students read on screen. They should not download or copy."
      />

      {(note || error) && (
        <div className={`alert ${error ? "error" : "ok"}`} style={{ marginBottom: "1rem" }}>
          {error || note}
        </div>
      )}

      <div className="split">
        <form className="glass admin-panel admin-form" onSubmit={onSaveMaterial}>
          <div className="admin-panel__head">
            <p className="eyebrow">Materials</p>
            <h2>Add learning material</h2>
          </div>

          <div className="admin-segment">
            <button
              type="button"
              className={matMode === "pdf" ? "is-active" : ""}
              onClick={() => setMatMode("pdf")}
            >
              Upload PDF
            </button>
            <button
              type="button"
              className={matMode === "notes" ? "is-active" : ""}
              onClick={() => setMatMode("notes")}
            >
              Text notes
            </button>
          </div>

          <div className="field">
            <label>Programme</label>
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              {data.courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}: {c.title}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Title</label>
            <input
              value={matTitle}
              onChange={(e) => setMatTitle(e.target.value)}
              placeholder={matMode === "pdf" ? "e.g. FA1 textbook pack" : "e.g. Session notes"}
              required
            />
          </div>
          <div className="field">
            <label>Read time (minutes)</label>
            <input
              type="number"
              min={5}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
            />
          </div>

          {matMode === "pdf" ? (
            <div className="field">
              <label>PDF file</label>
              <label className="admin-upload">
                <input type="file" accept="application/pdf,.pdf" onChange={onPickPdf} />
                <span className="admin-upload__box">
                  <strong>{pdfFile ? pdfFile.name : "Choose PDF"}</strong>
                  <span className="muted">
                    {pdfFile
                      ? `${(pdfFile.size / 1024).toFixed(0)} KB`
                      : "Demo limit about 1.8 MB. Opens on screen only."}
                  </span>
                </span>
              </label>
            </div>
          ) : (
            <div className="field">
              <label>Body (one paragraph per line)</label>
              <textarea rows={7} value={body} onChange={(e) => setBody(e.target.value)} required />
            </div>
          )}

          <button className="btn btn-primary" type="submit" disabled={pdfBusy}>
            {pdfBusy ? "Saving..." : matMode === "pdf" ? "Save PDF" : "Save notes"}
          </button>
        </form>

        <form
          className="glass admin-panel admin-form"
          onSubmit={(e) => {
            e.preventDefault();
            const opts = options
              .split("\n")
              .map((o) => o.trim())
              .filter(Boolean);
            if (opts.length < 2) return;
            addQuiz({ courseId, title: quizTitle, prompt, options: opts, answerIndex });
            setQuizTitle("");
            setPrompt("");
            setNote("Practice question added to the latest module.");
            setError("");
          }}
        >
          <div className="admin-panel__head">
            <p className="eyebrow">Practice</p>
            <h2>Add practice question</h2>
          </div>
          <div className="field">
            <label>Programme</label>
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              {data.courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Try-set title</label>
            <input value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} required />
          </div>
          <div className="field">
            <label>Question</label>
            <textarea rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} required />
          </div>
          <div className="field">
            <label>Options (one per line)</label>
            <textarea rows={4} value={options} onChange={(e) => setOptions(e.target.value)} required />
          </div>
          <div className="field">
            <label>Correct option index (0-based)</label>
            <input
              type="number"
              min={0}
              value={answerIndex}
              onChange={(e) => setAnswerIndex(Number(e.target.value))}
            />
          </div>
          <button className="btn btn-ink" type="submit">
            Save question
          </button>
        </form>
      </div>

      <section className="glass admin-panel" style={{ marginTop: "1.15rem" }}>
        <div className="admin-panel__head">
          <p className="eyebrow">Library</p>
          <h2>All materials</h2>
        </div>
        <div className="admin-material-grid">
          {materials.map((m) => {
            const course = courseById(m.courseId);
            return (
              <article key={m.id} className="admin-material-card">
                <div className="tag-row">
                  <span className="tag">{m.kind === "pdf" ? "PDF" : "Notes"}</span>
                  <span className="tag">{course?.code}</span>
                </div>
                <h3>{m.title}</h3>
                <p className="muted">
                  {m.minutes} min
                  {m.fileName ? ` | ${m.fileName}` : ""}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function AdminCourses() {
  const { data, updateCoursePrice } = useStore();
  const [drafts, setDrafts] = useState<Record<string, number>>(() =>
    Object.fromEntries(data.courses.map((c) => [c.id, c.priceGhs])),
  );
  const [saved, setSaved] = useState("");

  return (
    <div className="admin-page">
      <AdminHero
        eyebrow="Programmes"
        title="Fees"
        lead="Set the class fee shown on the public programme pages."
      />
      {saved && (
        <div className="alert ok" style={{ marginBottom: "1rem" }}>
          {saved}
        </div>
      )}
      <div className="admin-fee-grid">
        {data.courses.map((course) => (
          <article key={course.id} className="glass admin-panel admin-fee-card">
            <div className="tag-row">
              <span className="tag">{course.code}</span>
              <span className="tag">{course.level}</span>
            </div>
            <h2>{course.title}</h2>
            <p className="muted">{course.blurb}</p>
            <div className="admin-fee-card__row">
              <div className="field" style={{ minWidth: 160, flex: 1 }}>
                <label>Fee (GHS)</label>
                <input
                  type="number"
                  min={0}
                  value={drafts[course.id] ?? course.priceGhs}
                  onChange={(e) =>
                    setDrafts((d) => ({ ...d, [course.id]: Number(e.target.value) }))
                  }
                />
              </div>
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => {
                  updateCoursePrice(course.id, drafts[course.id] ?? course.priceGhs);
                  setSaved(`Updated ${course.code} to ${formatGhs(drafts[course.id] ?? course.priceGhs)}.`);
                }}
              >
                Save fee
              </button>
            </div>
            <p className="price">{formatGhs(drafts[course.id] ?? course.priceGhs)}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
