"use client"

import { Suspense } from "react"
import AuthPage from "./AuthPage"

export default function AuthWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-gray-500 dark:text-gray-300">
      Loading authentication...
    </div>}>
      <AuthPage />
    </Suspense>
  )
}
