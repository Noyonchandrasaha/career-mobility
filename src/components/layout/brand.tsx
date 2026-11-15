import Link from "next/link"
import { Compass } from "lucide-react"
export function Brand() {
  return (
    <Link
      href="/"
      className="flex min-h-11 items-center gap-2.5 font-semibold tracking-tight"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Compass className="size-5" aria-hidden="true" />
      </span>
      <span>Career Mobility</span>
    </Link>
  )
}
