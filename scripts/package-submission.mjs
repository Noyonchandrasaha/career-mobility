import {
  cp,
  mkdir,
  readdir,
  readFile,
  writeFile,
  lstat,
  rm,
  realpath,
} from "node:fs/promises"
import { resolve, relative, sep, basename } from "node:path"
import { createHash } from "node:crypto"
import { execFileSync } from "node:child_process"

const root = resolve(process.cwd())
const artifacts = resolve(root, "artifacts")
const stage = resolve(artifacts, "submission", "career-mobility-platform")
const zip = resolve(artifacts, "career-mobility-platform-submission.zip")
function checked(target) {
  const rel = relative(artifacts, resolve(target))
  if (!rel || rel.startsWith("..") || rel.startsWith(sep))
    throw new Error("Invalid artifact target.")
  return resolve(target)
}
const summary = JSON.parse(
  await readFile(resolve(root, "docs/evidence/summary.json"), "utf8")
)
if (
  summary.unitIntegration.failed ||
  summary.browser.failed ||
  summary.browser.flaky ||
  summary.browser.skipped
)
  throw new Error("Passing evidence is required before packaging.")
await mkdir(artifacts, { recursive: true })
await mkdir(resolve(artifacts, "submission"), { recursive: true })
if (
  (await realpath(resolve(artifacts, "submission"))).toLowerCase() !==
  resolve(artifacts, "submission").toLowerCase()
)
  throw new Error("Refusing a linked staging parent.")
try {
  if ((await lstat(zip)).isSymbolicLink())
    throw new Error("Refusing a linked ZIP target.")
} catch (error) {
  if (error.code !== "ENOENT") throw error
}
await rm(checked(stage), { recursive: true, force: true })
await mkdir(stage, { recursive: true })
const roots = [
  "src",
  "public",
  "supabase",
  "scripts",
  "tests",
  "docs",
  "README.md",
  "package.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "tsconfig.json",
  "next.config.ts",
  "postcss.config.mjs",
  "eslint.config.mjs",
  "components.json",
  "playwright.config.ts",
  "vitest.config.ts",
  ".env.example",
  ".gitignore",
  ".prettierignore",
  ".prettierrc",
  "AGENTS.md",
  "CLAUDE.md",
]
for (const entry of roots) {
  await cp(resolve(root, entry), resolve(stage, entry), {
    recursive: true,
    filter: async (path) => {
      const info = await lstat(path)
      return (
        !info.isSymbolicLink() &&
        (!basename(path).startsWith(".env") ||
          basename(path) === ".env.example")
      )
    },
  })
}
const files = []
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) await walk(path)
    else {
      const name = relative(stage, path).replaceAll(sep, "/")
      if (
        /(^|\/)(node_modules|\.git|\.next)(\/|$)/.test(name) ||
        (/^\.env/.test(entry.name) && entry.name !== ".env.example")
      )
        throw new Error("Excluded file entered submission.")
      files.push({
        path: name,
        sha256: createHash("sha256")
          .update(await readFile(path))
          .digest("hex"),
      })
    }
  }
}
await walk(stage)
files.sort((a, b) => a.path.localeCompare(b.path))
await writeFile(
  resolve(stage, "SUBMISSION-MANIFEST.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      scope:
        "Source, specifications, configuration examples and local verification evidence. No secrets/dependencies/build outputs.",
      files,
    },
    null,
    2
  ) + "\n"
)
if (process.platform !== "win32")
  throw new Error(
    "This archive command uses Windows Compress-Archive; the prepared source folder is portable."
  )
execFileSync(
  "powershell.exe",
  [
    "-NoProfile",
    "-NonInteractive",
    "-Command",
    "Compress-Archive -LiteralPath $env:CAREER_SUBMISSION_STAGE -DestinationPath $env:CAREER_SUBMISSION_ZIP -Force",
  ],
  {
    windowsHide: true,
    env: {
      ...process.env,
      CAREER_SUBMISSION_STAGE: checked(stage),
      CAREER_SUBMISSION_ZIP: checked(zip),
    },
    stdio: "pipe",
  }
)
const digest = createHash("sha256")
  .update(await readFile(zip))
  .digest("hex")
await writeFile(
  resolve(artifacts, "submission.sha256"),
  digest + "  " + basename(zip) + "\n"
)
console.log(
  `Source ZIP prepared: ${relative(root, zip)} (${files.length} files plus manifest). SHA-256 saved to artifacts/submission.sha256.`
)
