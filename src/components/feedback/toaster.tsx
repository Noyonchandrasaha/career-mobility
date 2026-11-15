"use client"
import { Toaster as Sonner } from "sonner"

export function Toaster() {
  return (
    <Sonner
      theme="light"
      position="bottom-right"
      closeButton
      toastOptions={{ className: "font-sans" }}
    />
  )
}
