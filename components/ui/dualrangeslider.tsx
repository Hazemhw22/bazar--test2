"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

interface DualRangeSliderProps {
  min: number
  max: number
  minValue: number
  maxValue: number
  step?: number
  onChange: (values: { min: number; max: number }) => void
  className?: string
}

export function DualRangeSlider({ min, max, minValue, maxValue, step = 1, onChange, className }: DualRangeSliderProps) {
  const [isDragging, setIsDragging] = React.useState<"min" | "max" | null>(null)

  const handleMouseDown = (type: "min" | "max") => (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(type)
  }

  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return

      const slider = document.getElementById("dual-range-slider")
      if (!slider) return

      const rect = slider.getBoundingClientRect()
      const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      const value = Math.round((min + percentage * (max - min)) / step) * step

      if (isDragging === "min" && value <= maxValue) {
        onChange({ min: value, max: maxValue })
      } else if (isDragging === "max" && value >= minValue) {
        onChange({ min: minValue, max: value })
      }
    },
    [isDragging, min, max, minValue, maxValue, step, onChange],
  )

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(null)
  }, [])

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const minPercentage = ((minValue - min) / (max - min)) * 100
  const maxPercentage = ((maxValue - min) / (max - min)) * 100

  return (
    <div className={cn("relative w-full", className)}>
      <div id="dual-range-slider" className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer">
        <div
          className="absolute h-2 bg-blue-600 rounded-full"
          style={{
            left: `${minPercentage}%`,
            width: `${maxPercentage - minPercentage}%`,
          }}
        />
        <div
          className="absolute w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-md cursor-pointer transform -translate-y-1"
          style={{ left: `calc(${minPercentage}% - 8px)` }}
          onMouseDown={handleMouseDown("min")}
        />
        <div
          className="absolute w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-md cursor-pointer transform -translate-y-1"
          style={{ left: `calc(${maxPercentage}% - 8px)` }}
          onMouseDown={handleMouseDown("max")}
        />
      </div>
    </div>
  )
}
