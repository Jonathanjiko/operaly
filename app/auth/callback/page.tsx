import { Suspense } from "react"
import AuthCallbackClient from "./AuthCallbackClient"

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC] px-6">
          <div className="w-full max-w-md rounded-3xl border border-[#E6EDF7] bg-white p-8 shadow-xl text-center">
            <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-[#DCE5F2] border-t-[#3B82F6]" />
            <h1 className="text-2xl font-bold text-[#132B73] mb-2">Conectando tu cuenta</h1>
            <p className="text-[#5F6B7A]">Confirmando acceso...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackClient />
    </Suspense>
  )
}
