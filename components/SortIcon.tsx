// components/icons/SortIcon.tsx
import React from "react"

const SortIcon = ({ className = "w-7 h-7 text-gray-700 dark:text-white" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 26 26"
    fill="currentColor"
    className={className}
  >
    <path d="M3 6h18v2H3V6zm4 5h10v2H7v-2zm4 5h2v2h-2v-2z" />
  </svg>
)

export default SortIcon
