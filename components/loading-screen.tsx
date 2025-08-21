"use client"

import { useEffect, useState } from "react"
import { CheckCircle, Package, Truck, Star } from "lucide-react"

interface LoadingScreenProps {
  onComplete: () => void
  userName?: string
}

export function LoadingScreen({ onComplete, userName = "User" }: LoadingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  const steps = [
    { icon: CheckCircle, text: "Authenticating...", color: "text-green-500" },
    { icon: Package, text: "Loading your profile...", color: "text-blue-500" },
    { icon: Truck, text: "Fetching your orders...", color: "text-purple-500" },
    { icon: Star, text: "Preparing your experience...", color: "text-yellow-500" },
  ]

  useEffect(() => {
    const stepDuration = 800 // Duration for each step
    const progressInterval = 50 // Update progress every 50ms

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 100 / (steps.length * (stepDuration / progressInterval))
        if (newProgress >= 100) {
          clearInterval(progressTimer)
          setTimeout(onComplete, 500) // Small delay before completing
          return 100
        }
        return newProgress
      })
    }, progressInterval)

    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(stepTimer)
          return prev
        }
        return prev + 1
      })
    }, stepDuration)

    return () => {
      clearInterval(progressTimer)
      clearInterval(stepTimer)
    }
  }, [onComplete, steps.length])

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-fuchsia-500 via-pink-500 to-purple-600 flex items-center justify-center z-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 border border-white rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 border border-white rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-32 left-40 w-20 h-20 border border-white rounded-full animate-pulse delay-700"></div>
        <div className="absolute bottom-20 right-20 w-16 h-16 border border-white rounded-full animate-pulse delay-500"></div>
        <div className="absolute top-1/2 left-10 w-12 h-12 border border-white rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-10 w-28 h-28 border border-white rounded-full animate-pulse delay-200"></div>
      </div>

      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        {/* Logo */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-2xl mb-4">
            <span className="text-2xl font-bold text-fuchsia-600">V</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">VRISTO</h1>
          <p className="text-pink-100 text-lg">Welcome back, {userName}!</p>
        </div>

        {/* Progress Circle */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle cx="60" cy="60" r="54" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="transparent" />
            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="white"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
            />
          </svg>

          {/* Progress percentage */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Current Step */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const StepIcon = step.icon
            const isActive = index === currentStep
            const isCompleted = index < currentStep

            return (
              <div
                key={index}
                className={`flex items-center justify-center gap-3 transition-all duration-500 ${
                  isActive ? "scale-110 opacity-100" : isCompleted ? "scale-100 opacity-70" : "scale-95 opacity-40"
                }`}
              >
                <div
                  className={`p-2 rounded-full transition-all duration-300 ${
                    isActive ? "bg-white shadow-lg" : isCompleted ? "bg-white/80" : "bg-white/30"
                  }`}
                >
                  <StepIcon size={20} className={isActive || isCompleted ? step.color : "text-gray-400"} />
                </div>
                <span
                  className={`font-medium transition-all duration-300 ${
                    isActive ? "text-white text-lg" : isCompleted ? "text-pink-100" : "text-pink-200"
                  }`}
                >
                  {step.text}
                </span>
              </div>
            )
          })}
        </div>

        {/* Loading dots */}
        <div className="flex justify-center gap-2 mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-white rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>

        {/* Motivational text */}
        <p className="text-pink-100 text-sm mt-6 animate-pulse">Setting up your personalized experience...</p>
      </div>
    </div>
  )
}
