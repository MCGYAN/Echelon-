from pathlib import Path
p = Path("src/index.css")
lines = p.read_text(encoding="utf-8").splitlines(keepends=True)
out = []
i = 0
removed = 0
while i < len(lines):
    # Remove duplicate main-pane block that only sets position/relative without padding
    if (
        lines[i].startswith(".main-pane {")
        and i + 1 < len(lines)
        and "position: relative" in lines[i + 1]
        and "padding" not in lines[i + 1]
    ):
        # skip until closing brace of this rule and the following ::before block
        # find end of .main-pane and .main-pane::before
        block = "".join(lines[i : i + 20])
        if "main-pane::before" in block and "padding" not in lines[i : i + 3][0] + lines[i + 1] + (lines[i + 2] if i + 2 < len(lines) else ""):
            # skip from .main-pane { through end of ::before block
            j = i
            braces = 0
            blocks = 0
            while j < len(lines) and blocks < 2:
                if "{" in lines[j]:
                    braces += lines[j].count("{")
                if "}" in lines[j]:
                    braces -= lines[j].count("}")
                    if braces == 0 and "{" not in lines[j] or (braces == 0 and "}" in lines[j]):
                        # completed a rule
                        if ".main-pane" in "".join(lines[i:j+1]) or blocks >= 0:
                            blocks += 1
                j += 1
                if blocks == 2 and braces == 0:
                    break
            # simpler: skip lines until we've closed two rules starting at i
            j = i
            rules = 0
            depth = 0
            started = False
            while j < len(lines) and rules < 2:
                line = lines[j]
                if "{" in line:
                    depth += line.count("{")
                    started = True
                if "}" in line:
                    depth -= line.count("}")
                    if started and depth == 0:
                        rules += 1
                        started = False
                j += 1
            # include trailing blank line
            if j < len(lines) and lines[j].strip() == "":
                j += 1
            removed += 1
            i = j
            continue
    out.append(lines[i])
    i += 1

p.write_text("".join(out), encoding="utf-8")
print("removed", removed)
