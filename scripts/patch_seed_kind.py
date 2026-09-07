from pathlib import Path
import re

p = Path("src/lib/seed.ts")
t = p.read_text(encoding="utf-8")
t = t.replace("echelon-lms-demo-v5", "echelon-lms-demo-v6")
t = re.sub(
    r'(id: "mat-[^"]+",\n        courseId: "[^"]+",\n        title: "[^"]+",\n        )minutes:',
    r'\1kind: "notes",\n        minutes:',
    t,
)
p.write_text(t, encoding="utf-8")
print("kind count", t.count('kind: "notes"'))
