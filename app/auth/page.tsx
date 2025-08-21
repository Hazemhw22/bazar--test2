"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import Image from "next/image"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { VristoLogo } from "@/components/vristo-logo"

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
  })
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = () => {
    const newErrors = {
      email: "",
      password: "",
      confirmPassword: "",
    }

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (isSignUp && !formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (isSignUp && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some((error) => error !== "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    // Show loader for 3 seconds
    await new Promise((resolve) => setTimeout(resolve, 3000))

    setIsLoading(false)

    // Frontend only - just log the data
    console.log("Login successful!", formData)
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Left Side - Form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
          <div className="w-full max-w-md space-y-8">
            {/* Logo */}
            <div className="text-center mb-6">
              <div className="rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <VristoLogo />
              </div>
            </div>

            {/* Welcome Text */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
              <p className="text-gray-600 dark:text-gray-400">Welcome Back, Please enter your details</p>
            </div>

            {/* Tab Switcher */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                  !isSignUp
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                  isSignUp
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                Signup
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 mb-6">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </Label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`pl-10 h-12 ${errors.email ? "border-red-500" : ""}`}
                    placeholder="Enter your email"
                  />
                  {formData.email && validateEmail(formData.email) && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  )}
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </Label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`pl-10 pr-10 h-12 ${errors.password ? "border-red-500" : ""}`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>

              {isSignUp && (
                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm Password
                  </Label>
                  <div className="mt-1 relative mb-6">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className={`pl-10 h-12 ${errors.confirmPassword ? "border-red-500" : ""}`}
                      placeholder="Confirm your password"
                    />
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
                </div>
              )}

              {!isSignUp && (
                <div className="flex items-center justify-between ">
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="remember"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) => handleInputChange("rememberMe", checked as boolean)}
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400">
                      Remember me
                    </Label>
                  </div>
                  <button type="button" className="text-sm text-blue-600 hover:text-blue-500 mb-4">
                    Forgot Password?
                  </button>
                </div>
              )}

              <Link href="/account">
                <Button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="loader"></div>
                    </div>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </Link>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">Or Continue With</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="flex justify-center">
              <Button variant="outline" className="w-full h-12 max-w-xs">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
            </div>

            
          </div>
        </div>

        {/* Right Side - Illustration */}
        <div className="flex-1 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center p-8">
          <div className="relative w-full max-w-lg">
            <Image
              src="/couple-going-shopping.png"
              alt="Shopping illustration"
              width={600}
              height={600}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
{/* Mobile Layout */}
<div className="lg:hidden min-h-screen relative">
  {/* Background Image */}
  <div className="absolute inset-0">
    <Image src="/nte6_qz8v_230606.jpg" alt="Background" fill className="object-cover" />
    <div className="absolute inset-0 bg-black/60"></div>
  </div>

  {/* Content */}
  <div className="relative z-5 min-h-screen flex flex-col pt-20 pb-8 px-6">
    {/* Logo Section */}
    <div className="mb-12 text-center">
      <div className="rounded-full flex items-center justify-center mx-auto">
        <VristoLogo />
      </div>
      <h1 className="text-3xl text-center text-white mt-6">Login To Vristo</h1>
    </div>

    {/* Form Section */}
    <div className="flex-1 flex flex-col justify-start">
      {/* Tab Switcher */}
      <div className="flex bg-white/10 backdrop-blur-sm rounded-full p-1 mb-8">
        <button
          onClick={() => setIsSignUp(false)}
          className={`flex-1 py-4 px-6 rounded-full text-sm font-medium transition-colors ${
            !isSignUp ? "bg-white text-gray-900" : "text-white"
          }`}
        >
          Login
        </button>
        <button
          onClick={() => setIsSignUp(true)}
          className={`flex-1 py-4 px-6 rounded-full text-sm font-medium transition-colors ${
            isSignUp ? "bg-white text-gray-900" : "text-white"
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <div className="relative mb-3">
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={`pl-12 h-16 bg-white/40 backdrop-blur-sm border-white/30 rounded-full text-white placeholder-white ${
                errors.email ? "border-red-400" : ""
              }`}
              placeholder="Enter your email"
            />
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white" size={20} />
          </div>
          {errors.email && <p className="mt-2 text-sm text-white">{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className={`pl-12 pr-12 h-16 bg-white/40 backdrop-blur-sm border-white/30 text-white placeholder-white rounded-full ${
                errors.password ? "border-red-400" : ""
              }`}
              placeholder="Enter your password"
            />
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white" size={20} />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && <p className="mt-2 text-sm text-red-300">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        {isSignUp && (
          <div>
            <div className="relative mb-3">
              <Input
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                className={`pl-12 h-16 bg-white/40 backdrop-blur-sm border-white/30 text-white placeholder-white rounded-full ${
                  errors.confirmPassword ? "border-red-400" : ""
                }`}
                placeholder="Confirm your password"
              />
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70" size={20} />
            </div>
            {errors.confirmPassword && <p className="mt-2 text-sm text-red-300">{errors.confirmPassword}</p>}
          </div>
        )}

        {/* Remember + Forgot */}
        {!isSignUp && (
          <div className="flex items-center justify-between text-sm py-3">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="remember-mobile"
                checked={formData.rememberMe}
                onCheckedChange={(checked) => handleInputChange("rememberMe", checked as boolean)}
              />
              <Label htmlFor="remember-mobile" className="text-white/90">
                Remember me
              </Label>
            </div>
            <button type="button" className="text-white/90">
              Forgot Password?
            </button>
          </div>
        )}

        {/* Submit */}
        <Link href="/account">
          <Button
            type="submit"
            className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full text-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="loader"></div>
              </div>
            ) : (
              "Login"
            )}
          </Button>
        </Link>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/30" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-transparent text-white/70">Or login with</span>
        </div>
      </div>

      {/* Social Login */}
      <div className="flex justify-center mb-4">
        <Button
          variant="outline"
          className="w-full h-14 bg-white/30 backdrop-blur-sm border-white/30 text-white rounded-full max-w-sm text-base"
        >
          <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>
      </div>

      {/* Footer */}
      <p className="text-center text-base text-white/80">
        {"Don't have an account? "}
        <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-blue-300 underline">
          Create an account
        </button>
      </p>
    </div>
  </div>
</div>


      <style jsx>{`
        .loader {
          width: 20px;
          aspect-ratio: 1.154;
          clip-path: polygon(50% 0, 100% 100%, 0 100%);
          --c: no-repeat linear-gradient(#ffffff 0 0);
          background: var(--c), var(--c), var(--c), var(--c), var(--c);
          background-size: 100% calc(100% / 5 + 1px);
          animation: l15 2s infinite;
        }
        @keyframes l15 {
          0% {
            background-position: 0 calc(-2 * 100% / 4), 0 calc(-2 * 100% / 4), 0 calc(-2 * 100% / 4),
              0 calc(-2 * 100% / 4), 0 calc(-2 * 100% / 4);
          }
          20% {
            background-position: 0 calc(4 * 100% / 4), 0 calc(-2 * 100% / 4), 0 calc(-2 * 100% / 4),
              0 calc(-2 * 100% / 4), 0 calc(-2 * 100% / 4);
          }
          40% {
            background-position: 0 calc(4 * 100% / 4), 0 calc(3 * 100% / 4), 0 calc(-2 * 100% / 4),
              0 calc(-2 * 100% / 4), 0 calc(-2 * 100% / 4);
          }
          60% {
            background-position: 0 calc(4 * 100% / 4), 0 calc(3 * 100% / 4), 0 calc(2 * 100% / 4),
              0 calc(-2 * 100% / 4), 0 calc(-2 * 100% / 4);
          }
          80% {
            background-position: 0 calc(4 * 100% / 4), 0 calc(3 * 100% / 4), 0 calc(2 * 100% / 4),
              0 calc(1 * 100% / 4), 0 calc(-2 * 100% / 4);
          }
          100% {
            background-position: 0 calc(4 * 100% / 4), 0 calc(3 * 100% / 4), 0 calc(2 * 100% / 4),
              0 calc(1 * 100% / 4), 0 calc(0 * 100% / 4);
          }
        }
      `}</style>
    </div>
  )
}
