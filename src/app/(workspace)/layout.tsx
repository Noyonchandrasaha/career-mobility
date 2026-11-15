import { WorkspaceProvider } from "@/components/layout/workspace-provider"
import { AppShell } from "@/components/layout/app-shell"
import { ShortlistProvider } from "@/components/shortlist/shortlist-provider"
export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <WorkspaceProvider>
      <ShortlistProvider>
        <AppShell>{children}</AppShell>
      </ShortlistProvider>
    </WorkspaceProvider>
  )
}
