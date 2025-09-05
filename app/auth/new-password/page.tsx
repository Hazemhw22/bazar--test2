"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function NewPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // استخراج access_token و refresh_token من الرابط
  const access_token = searchParams?.get("access_token")
  const refresh_token = searchParams?.get("refresh_token")

  useEffect(() => {
    if (access_token && refresh_token) {
      supabase.auth.setSession({
        access_token,
        refresh_token
      })
    }
  }, [access_token, refresh_token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")

    if (!password || !confirmPassword) {
      setError("Please fill in both fields")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!access_token || !refresh_token) {
      setError("Invalid or missing token")
      return
    }

    setIsLoading(true)

    // تغيير كلمة المرور بعد تعيين الجلسة
    const { error } = await supabase.auth.updateUser({ password })

    setIsLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setMessage("Password updated successfully! Redirecting to login...")
      setTimeout(() => {
        router.push("/auth")
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg p-8 shadow">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Reset Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-500 text-sm">{message}</p>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Updating..." : "Reset Password"}
          </Button>
        </form>
      </div>
    </div>
  )
}
