"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { VristoLogo } from "@/components/vristo-logo"

export default function NewPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isValidToken, setIsValidToken] = useState(false)

  // استخراج access_token و refresh_token من الرابط
  const access_token = searchParams?.get("access_token")
  const refresh_token = searchParams?.get("refresh_token")

  useEffect(() => {
    if (access_token && refresh_token) {
      supabase.auth.setSession({
        access_token,
        refresh_token
      }).then(({ data, error }) => {
        if (error) {
          setError("Invalid or expired reset link. Please request a new password reset.")
        } else {
          setIsValidToken(true)
        }
      })
    } else {
      setError("Invalid or missing reset link. Please request a new password reset.")
    }
  }, [access_token, refresh_token])

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return "Password must be at least 6 characters long"
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setIsSuccess(false)

    if (!password || !confirmPassword) {
      setError("Please fill in both fields")
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!isValidToken) {
      setError("Invalid or expired reset link. Please request a new password reset.")
      return
    }

    setIsLoading(true)

    try {
      // تغيير كلمة المرور بعد تعيين الجلسة
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        setError(error.message)
      } else {
        setIsSuccess(true)
        setMessage("Password updated successfully! Redirecting to your account...")
        setTimeout(() => {
          router.push("/account")
        }, 2000)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex min-h-screen">
        {/* Left Side - Form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
          <div className="w-full max-w-md space-y-8">
            {/* Logo */}
            <div className="text-center mb-6">
              <div className="rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <VristoLogo />
              </div>
            </div>

            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Set New Password
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Enter your new password below. Make sure it's secure and easy to remember.
              </p>
            </div>

            {/* Success Message */}
            {isSuccess && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                  <p className="text-green-800 dark:text-green-200 text-sm">{message}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
                  <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password
                </Label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12"
                    placeholder="Enter new password"
                    disabled={isLoading || !isValidToken}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters long</p>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </Label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 h-12"
                    placeholder="Confirm new password"
                    disabled={isLoading || !isValidToken}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                disabled={isLoading || !isValidToken || isSuccess}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="loader"></div>
                    <span className="ml-2">Updating...</span>
                  </div>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>

            {/* Back to Login */}
            <div className="text-center">
              <Link
                href="/auth"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <ArrowLeft size={16} className="mr-1" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side - Illustration */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 items-center justify-center p-8">
          <div className="relative w-full max-w-lg">
            <div className="text-center space-y-4">
              <div className="w-32 h-32 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                <Lock size={48} className="text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-green-900 dark:text-green-100">
                Secure Your Account
              </h3>
              <p className="text-green-800 dark:text-green-200">
                Choose a strong password to keep your account safe and secure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
