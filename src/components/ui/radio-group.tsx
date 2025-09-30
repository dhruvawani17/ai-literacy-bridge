import React from 'react'
import { cn } from '@/lib/utils'

interface RadioGroupProps {
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  children: React.ReactNode
}

interface RadioGroupItemProps {
  value: string
  id?: string
  className?: string
  disabled?: boolean
}

const RadioGroupContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
}>({})

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, children, ...props }, ref) => {
    return (
      <RadioGroupContext.Provider value={{ value, onValueChange }}>
        <div ref={ref} className={cn('grid gap-2', className)} {...props}>
          {children}
        </div>
      </RadioGroupContext.Provider>
    )
  }
)
RadioGroup.displayName = 'RadioGroup'

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, id, disabled, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext)
    const isChecked = context.value === value

    return (
      <div className="relative">
        <input
          type="radio"
          ref={ref}
          id={id}
          value={value}
          checked={isChecked}
          onChange={() => context.onValueChange?.(value)}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        <label
          htmlFor={id}
          className={cn(
            'flex h-4 w-4 items-center justify-center rounded-full border border-gray-300 bg-white cursor-pointer transition-colors',
            'hover:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
            isChecked && 'border-blue-600',
            disabled && 'opacity-75 cursor-not-allowed',
            className
          )}
        >
          {isChecked && (
            <div className="h-2 w-2 rounded-full bg-blue-600" />
          )}
        </label>
      </div>
    )
  }
)
RadioGroupItem.displayName = 'RadioGroupItem'

export { RadioGroup, RadioGroupItem }