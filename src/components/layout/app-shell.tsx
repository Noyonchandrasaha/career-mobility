"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Menu, ShieldCheck } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Brand } from "./brand"
import { SidebarNav } from "./sidebar-nav"
import { useWorkspace } from "./workspace-provider"
import {
  ErrorState,
  WorkspaceLoading,
} from "@/components/feedback/workspace-feedback"

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const path = usePathname()
  const { status, error, retry, profile, dirty } = useWorkspace()
  const title =
    path === "/profile"
      ? "My Profile"
      : path === "/saved"
        ? "Saved Jobs"
        : path.startsWith("/opportunities/")
          ? "Opportunity Details"
          : "Recommendations"
  const mode = process.env.NEXT_PUBLIC_DATA_MODE
  return (
    <div className="min-h-svh">
      <aside
        aria-label="Workspace sidebar"
        className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r bg-sidebar p-5 lg:flex"
      >
        <Brand />
        <div className="mt-10">
          <SidebarNav />
        </div>
        <div className="mt-auto space-y-3 border-t pt-5">
          <ShieldCheck
            className="size-5 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="text-xs leading-5 text-muted-foreground">
            Assessment prototype
            <br />
            Fictional opportunities
          </p>
        </div>
      </aside>
      <div className="min-w-0 lg:pl-60">
        <header className="sticky top-0 z-30 flex h-[68px] min-w-0 items-center justify-between gap-2 border-b bg-card px-4 md:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <div className="lg:hidden">
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
                  side="left"
                  className="w-[min(320px,85vw)] gap-6 p-4 [&_[data-slot=sheet-close]]:size-11"
                >
                  <SheetHeader className="px-0 pr-12">
                    <SheetTitle>Career Mobility</SheetTitle>
                    <SheetDescription>Your career workspace</SheetDescription>
                  </SheetHeader>
                  <SidebarNav onNavigate={() => setOpen(false)} />
                  <p className="mt-auto text-xs text-muted-foreground">
                    Assessment prototype · Fictional opportunities
                  </p>
                </SheetContent>
              </Sheet>
            </div>
            <span className="text-sm font-semibold lg:hidden">
              Career Mobility
            </span>
            <nav
              aria-label="Breadcrumb"
              className="hidden items-center gap-2 text-sm text-muted-foreground lg:flex"
            >
              <Link
                href={
                  path.startsWith("/opportunities/") ? "/recommendations" : "/"
                }
                className="rounded py-3 hover:text-foreground"
              >
                {path.startsWith("/opportunities/")
                  ? "Recommendations"
                  : "Home"}
              </Link>
              <ChevronRight className="size-3" aria-hidden="true" />
              <span aria-current="page" className="font-medium text-foreground">
                {title}
              </span>
            </nav>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            {mode === "mock" && (
              <span className="rounded-md border border-warning-soft-foreground/15 bg-warning-soft px-2 py-1 text-xs font-medium text-warning-soft-foreground">
                Demo Mode
              </span>
            )}
            <Link
              href="/profile"
              className="hidden min-h-11 items-center text-sm font-medium text-primary sm:inline-flex"
            >
              {profile ? "Edit Profile" : "Create Profile"}
              {dirty && <span className="sr-only"> — unsaved changes</span>}
            </Link>
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="app-page outline-none">
          <div className="app-container">
            {path.startsWith("/opportunities/") ? (
              children
            ) : status === "loading" ? (
              <WorkspaceLoading />
            ) : status === "error" ? (
              <ErrorState
                title="Your workspace is unavailable"
                message={error ?? "Please retry."}
                onRetry={retry}
              />
            ) : (
              children
            )}
          </div>
        </main>
        <footer className="app-container pb-6 text-xs leading-5 text-muted-foreground">
          Career Mobility · Assessment prototype · {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  )
}
