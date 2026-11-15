import Link from "next/link"
export function PublicFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="app-container flex flex-col gap-3 py-6 text-xs leading-5 text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-medium text-foreground">Career Mobility</span> ·
          Assessment prototype · {new Date().getFullYear()}
        </p>
        <Link
          href="/profile"
          className="inline-flex min-h-11 items-center font-medium hover:text-primary"
        >
          Start your career profile →
        </Link>
      </div>
    </footer>
  )
}
