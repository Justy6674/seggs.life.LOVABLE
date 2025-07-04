import React from 'react'

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  className?: string
}

export function Switch({ checked, onCheckedChange, className = '' }: SwitchProps) {
  return (
    <button
      type="button"
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${
        checked ? 'bg-pink-500' : 'bg-gray-200'
      } ${className}`}
      onClick={() => onCheckedChange(!checked)}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
} 