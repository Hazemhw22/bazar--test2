"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, User, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from "@/lib/supabase" 
import { FcGoogle } from "react-icons/fc"
import { FaFacebook } from "react-icons/fa6"
import { AiFillApple } from "react-icons/ai"
import { useI18n } from "@/lib/i18n"

export default function AuthPage() {
  const { t, direction } = useI18n()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [generalError, setGeneralError] = useState("")

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
  })

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    const message = searchParams?.get("message")
    if (message) {
      setSuccessMessage(decodeURIComponent(message))
      setTimeout(() => setSuccessMessage(""), 5000)
    }
  }, [searchParams])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = () => {
    const newErrors = { fullName: "", email: "", password: "", confirmPassword: "" }

    if (isSignUp && !formData.fullName) newErrors.fullName = t("auth.errors.fullNameRequired")

    if (!formData.email) newErrors.email = t("auth.errors.emailRequired")
    else if (!validateEmail(formData.email)) newErrors.email = t("auth.errors.emailInvalid")

    if (!formData.password) newErrors.password = t("auth.errors.passwordRequired")
    else if (formData.password.length < 6) newErrors.password = t("auth.errors.passwordTooShort")

    if (isSignUp) {
      if (!formData.confirmPassword) newErrors.confirmPassword = t("auth.errors.confirmPasswordRequired")
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t("auth.errors.passwordsDoNotMatch")
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some((error) => error !== "")
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof typeof errors]) setErrors((prev) => ({ ...prev, [field]: "" }))
    if (generalError) setGeneralError("")
    if (successMessage) setSuccessMessage("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setGeneralError("")
    setSuccessMessage("")

    try {
      if (!isSignUp) {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (error) {
          setGeneralError(error.message)
        } else if (data.session && data.user) {
          // Check if user profile exists, create if not
          try {
            const profileCheckResponse = await fetch('/api/users/create-profile-service', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
                roleId: 7, // Customer role
              }),
            });

            if (!profileCheckResponse.ok) {
              console.error('Failed to ensure user profile exists');
            }
          } catch (error) {
            console.error('Error checking/creating profile on login:', error);
          }

          setSuccessMessage("Login successful! Redirecting...")
          setTimeout(() => router.push("/account"), 500)
        } else {
          setGeneralError("Login failed. Please try again.")
        }
      } else {
        // Sign Up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (signUpError || !signUpData.user?.id) {
          setGeneralError(signUpError?.message || "Failed to create user.")
          setIsLoading(false)
          return
        }

        // Create user profile immediately using service role
        // This ensures the profile exists even before email verification
        try {
          const profileResponse = await fetch('/api/users/create-profile-service', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: signUpData.user.id,
              email: formData.email,
              name: formData.fullName,
              roleId: 7, // Customer role
            }),
          });

          const profileResult = await profileResponse.json();

          if (!profileResponse.ok) {
            console.error('Error creating user profile:', profileResult);
            setGeneralError('Account created, but there was an error setting up your profile. Please contact support.');
            setIsLoading(false);
            return;
          }

          console.log('User profile created successfully:', profileResult);
        } catch (error) {
          console.error('Error in profile creation:', error);
          setGeneralError('Account created, but there was an error setting up your profile. Please contact support.');
          setIsLoading(false);
          return;
        }

        // Show success message
        setSuccessMessage(t("auth.signUpSuccess") || "Account created successfully! Please check your email to verify your account.");
        
        // Reset form
        setIsSignUp(false);
        setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      }
    } catch {
      setGeneralError("An unexpected error occurred. Please try again.")
    }

    setIsLoading(false)
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setGeneralError("")
    setSuccessMessage("")

    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      })

      if (error) setGeneralError(error.message)
      // بعد نجاح العملية سيتم إعادة التوجيه تلقائياً من Supabase
    } catch {
      setGeneralError("An unexpected error occurred with Google sign-in. Please try again.")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* اليسار - الفورم */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
          <div className="w-full max-w-md space-y-8 mobile:max-w-[480px]">
            <div className="text-center mb-6">
              <div className="rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm lg:hidden">
                <img src="/login.svg" alt="" />
              </div>
            </div>

            <div className={`${direction === "rtl" ? "text-right" : "text-left"} space-y-2`}>
              <h1 className="text-4xl font-extrabold leading-tight">{isSignUp ? t("auth.createYour") : t("auth.loginToYour")}</h1>
              <h2 className="text-4xl font-extrabold">{t("auth.account")}</h2>
            </div>

            <div className="flex bg-card rounded-full p-1 border border-border/50">
              <button
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-3 px-4 rounded-full text-sm font-medium transition-colors ${
                  !isSignUp
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {t("auth.signIn")}
              </button>
              <button
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-3 px-4 rounded-full text-sm font-medium transition-colors ${
                  isSignUp
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {t("auth.signUp")}
              </button>
            </div>

            {successMessage && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                  <p className="text-green-800 dark:text-green-200 text-sm">{successMessage}</p>
                </div>
              </div>
            )}

            {generalError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
                  <p className="text-red-800 dark:text-red-200 text-sm">{generalError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 mb-6">
              {isSignUp && (
                <div>
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("auth.placeholders.fullName")}
                  </Label>
                  <div className="mt-1 relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      className={`pl-10 h-12 ${errors.fullName ? "border-red-500" : ""}`}
                      placeholder={t("auth.placeholders.fullName")}
                    />
                  </div>
                  {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>}
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("auth.placeholders.email")}
                </Label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`pl-10 h-12 ${errors.email ? "border-red-500" : ""}`}
                    placeholder={t("auth.placeholders.email")}
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("auth.placeholders.password")}
                </Label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`pl-10 pr-10 h-12 ${errors.password ? "border-red-500" : ""}`}
                    placeholder={t("auth.placeholders.password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>

              {isSignUp && (
                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("auth.placeholders.confirmPassword")}
                  </Label>
                  <div className="mt-1 relative mb-6">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className={`pl-10 h-12 ${errors.confirmPassword ? "border-red-500" : ""}`}
                      placeholder={t("auth.placeholders.confirmPassword")}
                    />
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
                </div>
              )}

              {!isSignUp && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 mb-4">
                    <Checkbox
                      id="remember"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) => handleInputChange("rememberMe", checked as boolean)}
                    />
                    <Label htmlFor="remember" className="text-sm text-muted-foreground">
                      {t("auth.rememberMe")}
                    </Label>
                  </div>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-primary hover:underline mb-4 inline-block"
                  >
                    {t("auth.forgotPassword")}
                  </Link>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 rounded-full"
                disabled={isLoading}
              >
                {isLoading ? t("auth.loading") : isSignUp ? t("auth.signUp") : t("auth.signIn")}
              </Button>
            </form>

              {/* Social Auth */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex-1 h-px bg-border" />
                <span>{t("auth.orContinueWith")}</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="flex items-center justify-center gap-4">
                <button 
                  type="button"
                  onClick={() => {}} 
                  className="w-14 h-14 rounded-2xl bg-card border border-border/60 flex items-center justify-center text-blue-600"
                >
                  <FaFacebook size={24} />
                </button>
                <button 
                  type="button"
                  onClick={handleGoogleSignIn} 
                  className="w-14 h-14 rounded-2xl bg-card border border-border/60 flex items-center justify-center"
                  disabled={isLoading}
                >
                  <FcGoogle size={24} />
                </button>
                <button 
                  type="button"
                  onClick={() => {}} 
                  className="w-14 h-14 rounded-2xl bg-card border border-border/60 flex items-center justify-center"
                >
                  <AiFillApple size={24} />
                </button>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                {isSignUp ? (
                  <>{t("auth.alreadyHaveAccount")} <Link href="/auth" className="text-primary">{t("auth.signIn")}</Link></>
                ) : (
                  <>{t("auth.noAccount")} <button onClick={() => setIsSignUp(true)} className="text-primary">{t("auth.signUp")}</button></>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* اليمين - الصورة */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-green-100 to-green-200 dark:from-pink-900 dark:to-blue-700 items-center justify-center p-8">
          <div className="relative w-full max-w-lg">
            <Image
              src="/login.svg"
              alt="Shopping illustration"
              width={600}
              height={600}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  )
}