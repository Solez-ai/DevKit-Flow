import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked)
    }

    return (
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          ref={ref}
          className="sr-only"
          checked={checked}
          onChange={handleChange}
          {...props}
        />
        <div
          className={cn(
            "relative w-11 h-6 rounded-full transition-colors",
            checked ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700",
            className
          )}
        >
          <div
            className={cn(
              "absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform",
              checked ? "translate-x-full border-white" : ""
            )}
          />
        </div>
      </label>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }