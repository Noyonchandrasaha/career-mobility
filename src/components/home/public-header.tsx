"use client"
import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Brand } from "@/components/layout/brand"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet"
const links = [
  { href: "/", label: "Home" },
  { href: "/profile", label: "My Profile" },
  { href: "/recommendations", label: "Recommendations" },
  { href: "/saved", label: "Saved" },
]
export function PublicHeader() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-30 border-b bg-card">
      <div className="app-container flex h-[68px] items-center justify-between gap-4">
        <Brand />
        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={link.href === "/" ? "page" : undefined}
              className="inline-flex min-h-11 items-center text-sm font-medium text-muted-foreground hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  className="size-11"
                  aria-label="Open navigation"
                />
              }
            >
              <Menu aria-hidden="true" />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[min(320px,85vw)] p-4 [&_[data-slot=sheet-close]]:size-11"
            >
              <SheetHeader className="px-0 pr-12">
                <SheetTitle>Career Mobility</SheetTitle>
                <SheetDescription>
                  Explore your career possibilities
                </SheetDescription>
              </SheetHeader>
              <nav aria-label="Primary" className="space-y-1">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={link.href === "/" ? "page" : undefined}
                    className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium hover:bg-muted"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
