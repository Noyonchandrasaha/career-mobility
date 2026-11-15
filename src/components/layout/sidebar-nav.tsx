"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bookmark, BriefcaseBusiness, House, UserRound } from "lucide-react"
import { cn } from "@/lib/utils"
const links = [
  { href: "/", label: "Overview", icon: House },
  { href: "/profile", label: "My Profile", icon: UserRound },
  {
    href: "/recommendations",
    label: "Recommendations",
    icon: BriefcaseBusiness,
  },
  { href: "/saved", label: "Saved Jobs", icon: Bookmark },
]
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname()
  return (
    <nav aria-label="Primary" className="space-y-1">
      {links.map(({ href, label, icon: Icon }) => {
        const active =
          path === href ||
          (href === "/recommendations" && path.startsWith("/opportunities/"))
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted",
              active
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                : "text-sidebar-foreground"
            )}
          >
            <Icon className="size-[18px] shrink-0" aria-hidden="true" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
