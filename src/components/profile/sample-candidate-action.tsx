"use client"
import { useState } from "react"
import { FlaskConical } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
export function SampleCandidateAction({
  hasContent,
  disabled,
  onLoad,
}: {
  hasContent: boolean
  disabled: boolean
  onLoad(): void
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="min-h-11 px-4"
        disabled={disabled}
        onClick={() => (hasContent ? setOpen(true) : onLoad())}
      >
        <FlaskConical aria-hidden="true" />
        Load Sample Candidate
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Replace the current form?</AlertDialogTitle>
            <AlertDialogDescription>
              This loads an illustrative candidate and replaces your current
              form edits. Your saved profile changes only when you save.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-11 px-4">
              Keep my edits
            </AlertDialogCancel>
            <AlertDialogAction
              className="min-h-11 px-4"
              onClick={() => {
                onLoad()
                setOpen(false)
              }}
            >
              Replace form
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
