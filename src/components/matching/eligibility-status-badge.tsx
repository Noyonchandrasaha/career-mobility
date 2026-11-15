import { CircleCheck, CircleHelp, ShieldAlert } from "lucide-react"
import type { EligibilityStatus } from "@/types/domain"
import { ELIGIBILITY_LABELS } from "@/lib/constants/domain"
import { cn } from "@/lib/utils"
const appearances = {
  no_identified_blocker: {
    icon: CircleCheck,
    color: "bg-success-soft text-success-soft-foreground",
  },
  requires_verification: {
    icon: CircleHelp,
    color: "bg-warning-soft text-warning-soft-foreground",
  },
  blocked: {
    icon: ShieldAlert,
    color: "bg-danger-soft text-danger-soft-foreground",
  },
}
export function EligibilityStatusBadge({
  status,
}: {
  status: EligibilityStatus
}) {
  const { icon: Icon, color } = appearances[status]
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium",
        color
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      {ELIGIBILITY_LABELS[status]}
    </span>
  )
}
