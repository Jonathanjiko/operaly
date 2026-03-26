"use client"

import { CheckCircle2, AlertCircle, X } from "lucide-react"

type AppToastProps = {
  open: boolean
  type?: "success" | "error" | "info"
  message: string
  onClose: () => void
}

export function AppToast({
  open,
  type = "info",
  message,
  onClose,
}: AppToastProps) {
  if (!open || !message) {
    return null
  }

  const styles =
    type === "success"
      ? "border-green-200 bg-green-50 text-green-800"
      : type === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-blue-200 bg-blue-50 text-blue-800"

  return (
    <div className="fixed top-5 right-5 z-[100]">
      <div
        className={`min-w-[320px] max-w-[440px] rounded-2xl border shadow-xl px-4 py-4 flex items-start gap-3 ${styles}`}
      >
        <div className="mt-0.5">
          {type === "success" ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
        </div>

        <div className="flex-1 text-sm font-medium">
          {message}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
