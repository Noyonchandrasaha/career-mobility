import { readFile, writeFile, mkdir, realpath } from "node:fs/promises"
import { resolve, relative, sep } from "node:path"
import { createHash } from "node:crypto"
import { execFileSync } from "node:child_process"

if (process.platform !== "win32")
  throw new Error(
    "This archive extraction verifier uses Windows .NET ZIP support."
  )
const root = resolve(process.cwd())
const artifacts = resolve(root, "artifacts")
if ((await realpath(artifacts)).toLowerCase() !== artifacts.toLowerCase())
  throw new Error("Refusing a linked artifact directory.")
const zip = resolve(artifacts, "career-mobility-platform-submission.zip")
const digest = createHash("sha256")
  .update(await readFile(zip))
  .digest("hex")
const expected = (
  await readFile(resolve(artifacts, "submission.sha256"), "utf8")
).split(/\s+/)[0]
if (digest !== expected) throw new Error("Archive checksum mismatch.")
let destination
for (let number = 1; number <= 100; number++) {
  const candidate = resolve(artifacts, "reviewer-check-" + number)
  try {
    await mkdir(candidate)
    destination = candidate
    break
  } catch (error) {
    if (error.code !== "EEXIST") throw error
  }
}
if (!destination)
  throw new Error("No empty reviewer-check directory available.")
execFileSync(
  "powershell.exe",
  [
    "-NoProfile",
    "-NonInteractive",
    "-Command",
    `
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::OpenRead($env:CAREER_SUBMISSION_ZIP)
try {
  foreach ($entry in $archive.Entries) {
    if ($entry.FullName -match '(^[/\\\\]|(^|[/\\\\])\\.\\.([/\\\\]|$)|:)') { throw 'Unsafe archive path.' }
  }
} finally { $archive.Dispose() }
[System.IO.Compression.ZipFile]::ExtractToDirectory($env:CAREER_SUBMISSION_ZIP, $env:CAREER_REVIEWER_DESTINATION)
`,
  ],
  {
    windowsHide: true,
    env: {
      ...process.env,
      CAREER_SUBMISSION_ZIP: zip,
      CAREER_REVIEWER_DESTINATION: destination,
    },
    stdio: "pipe",
  }
)
const source = resolve(destination, "career-mobility-platform")
const manifest = JSON.parse(
  await readFile(resolve(source, "SUBMISSION-MANIFEST.json"), "utf8")
)
for (const file of manifest.files) {
  const path = resolve(source, file.path)
  const rel = relative(source, path)
  if (!rel || rel.startsWith("..") || rel.startsWith(sep))
    throw new Error("Unsafe manifest path.")
  if (
    /(^|\/)(node_modules|\.git|\.next)(\/|$)/.test(file.path) ||
    /(^|\/)\.env(?!\.example$)/.test(file.path)
  )
    throw new Error("Excluded file in manifest.")
  const actual = createHash("sha256")
    .update(await readFile(path))
    .digest("hex")
  if (actual !== file.sha256)
    throw new Error("Source checksum mismatch: " + file.path)
}
for (const required of [
  ".env.example",
  "pnpm-lock.yaml",
  "src/app/page.tsx",
  "docs/technical-note.md",
  "docs/test-evidence.md",
  "docs/ai-tool-disclosure.md",
  "supabase/migrations/202611150001_career_mobility.sql",
]) {
  if (!manifest.files.some((file) => file.path === required))
    throw new Error("Missing required source: " + required)
}
const report = {
  archiveSha256: digest,
  sourceDirectory: relative(root, source).replaceAll(sep, "/"),
  verifiedFiles: manifest.files.length,
  archiveIntegrity: "PASS",
  dependencyInstall: "NOT_RUN",
  build: "NOT_RUN",
  tests: "NOT_RUN",
  runtimeFingerprint: createHash("sha256")
    .update(
      JSON.stringify(
        manifest.files.filter(
          (file) => !file.path.startsWith("docs/") && file.path !== "README.md"
        )
      )
    )
    .digest("hex"),
}
try {
  const verified = JSON.parse(
    await readFile(resolve(root, "docs/evidence/reviewer-install.json"), "utf8")
  )
  if (verified.runtimeFingerprint !== report.runtimeFingerprint)
    throw new Error(
      "Packaged runtime differs from the clean-install verification."
    )
  report.cleanRuntimeMatches = true
} catch (error) {
  if (error.code !== "ENOENT") throw error
}
await writeFile(
  resolve(artifacts, "package-check.json"),
  JSON.stringify(report, null, 2) + "\n"
)
console.log(JSON.stringify(report))
