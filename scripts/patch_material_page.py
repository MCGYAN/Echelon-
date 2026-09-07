from pathlib import Path

NEW = r'''export function MaterialPage() {
  const { materialId } = useParams();
  const { materialById, courseById, isEnrolled, markModuleComplete, data, currentUser } = useStore();
  const material = materialById(materialId ?? "");
  const navigate = useNavigate();

  if (!material) return <p>Notes not found.</p>;
  if (!isEnrolled(material.courseId)) return <Navigate to={`/courses/${material.courseId}`} replace />;

  const course = courseById(material.courseId);
  const module = data.modules.find((m) => m.materialId === material.id);
  const onContextMenu = (e: MouseEvent) => e.preventDefault();
  const isPdf = material.kind === "pdf" && Boolean(material.fileDataUrl);
  const pdfSrc = material.fileDataUrl
    ? `${material.fileDataUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`
    : "";

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
          <iframe title={material.title} src={pdfSrc} className="pdf-viewer__frame" />
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

'''

p = Path("src/pages/LearnPages.tsx")
t = p.read_text(encoding="utf-8")
start = t.index("export function MaterialPage()")
end = t.index("export function QuizPage()")
t = t[:start] + NEW + t[end:]

# Also improve materials list tags
old = '''                  <div className="tag-row" style={{ marginBottom: "0.4rem" }}>
                    <span className="tag">{course?.code ?? "Class"}</span>
                    <span className="tag">{material.minutes} min</span>
                  </div>'''
new = '''                  <div className="tag-row" style={{ marginBottom: "0.4rem" }}>
                    <span className="tag">{course?.code ?? "Class"}</span>
                    <span className="tag">{material.kind === "pdf" ? "PDF" : "Notes"}</span>
                    <span className="tag">{material.minutes} min</span>
                  </div>'''
# handle possible double newlines in file
import re
t2, n = re.subn(
    r'<div className="tag-row" style=\{\{ marginBottom: "0\.4rem" \}\}>\s*'
    r'<span className="tag">\{course\?\.code \?\? "Class"\}</span>\s*'
    r'<span className="tag">\{material\.minutes\} min</span>\s*'
    r'</div>',
    new,
    t,
    count=1,
)
print("tag replace", n)
p.write_text(t2 if n else t, encoding="utf-8")
print("MaterialPage replaced")
