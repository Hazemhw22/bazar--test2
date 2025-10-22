"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useI18n } from "@/lib/i18n"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { VristoLogo } from "@/components/vristo-logo"

export default function ForgotPasswordPage() {
  const { t } = useI18n()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setIsSuccess(false)

    if (!email) {
      setError("Email is required")
      return
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address")
      return
    }

    setIsLoading(true)

    try {
      // First check if email exists in the database
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .eq("email", email)
        .single()

      if (profileError || !profileData) {
        setError("No account found with this email address")
        setIsLoading(false)
        return
      }

      // Send password reset email
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/new-password`,
      })

      if (error) {
        setError(error.message)
      } else {
        setIsSuccess(true)
        setMessage("Password reset link has been sent to your email. Please check your inbox and follow the instructions to reset your password.")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* Left Side - Form */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
          <div className="w-full max-w-md space-y-8">
            {/* Logo */}
            <div className="text-center mb-6">
              <div className="rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm lg:hidden">
                <img src="/phishing-account-concept.png" alt="" />
              </div>
            </div>

            {/* Header */}
            <div className="text-left space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t("auth.forgotPassword")}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t("auth.forgot.hint")}
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
            <form onSubmit={handleReset} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("auth.emailLabel")}
                </Label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                    placeholder={t("auth.placeholders.email")}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-full"
                disabled={isLoading || isSuccess}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="loader"></div>
                    <span className="ml-2">{t("auth.sending")}</span>
                  </div>
                ) : (
                  t("auth.sendResetLink")
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
                {t("auth.backToLogin")}
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side - Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-green-100 to-green-200 dark:from-pink-900 dark:to-blue-700 items-center justify-center p-8">
          <div className="relative w-full max-w-lg">
            <div className="text-center space-y-4">
              <div className="mx-auto rounded-full flex items-center justify-center">
                <img src="/phishing-account-concept.png" alt="" />
              </div>
              <h3 className="text-2xl font-semibold text-blue-900 dark:text-blue-100">
                Reset Your Password
              </h3>
              <p className="text-blue-800 dark:text-blue-200">
                We'll help you get back into your account quickly and securely.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
