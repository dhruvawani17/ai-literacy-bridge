import React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckboxProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  id?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, disabled, id, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          type="checkbox"
          ref={ref}
          id={id}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        <label
          htmlFor={id}
          className={cn(
            'flex h-4 w-4 items-center justify-center rounded-sm border border-gray-300 bg-white cursor-pointer transition-colors',
            'hover:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
            checked && 'bg-blue-600 border-blue-600 text-white',
            disabled && 'opacity-75 cursor-not-allowed',
            className
          )}
        >
          {checked && <Check className="h-3 w-3" />}
        </label>
      </div>
    )
  }
)
Checkbox.displayName = 'Checkbox'

export { Checkbox }