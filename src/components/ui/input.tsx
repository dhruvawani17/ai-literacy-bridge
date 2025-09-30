import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-white px-3 py-1 text-sm text-purple-800 font-medium shadow-md transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-600 hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-75",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }