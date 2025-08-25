'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useAnnouncer } from '@/lib/accessibility-utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface AccessibleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  successMessage?: string
  errorMessage?: string
  announceOnClick?: boolean
  announceMessage?: string
}

const AccessibleButton = React.forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      loadingText = 'Loading...',
      successMessage,
      errorMessage,
      announceOnClick = false,
      announceMessage,
      children,
      onClick,
      disabled,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const { announce } = useAnnouncer()
    const [actionState, setActionState] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle')

    const Comp = asChild ? Slot : 'button'

    const handleClick = React.useCallback(
      async (event: React.MouseEvent<HTMLButtonElement>) => {
        if (loading || disabled) return

        // Announce click if requested
        if (announceOnClick && announceMessage) {
          announce(announceMessage, 'assertive')
        }

        if (onClick) {
          try {
            setActionState('loading')
            await onClick(event)
            
            if (successMessage) {
              setActionState('success')
              announce(successMessage, 'polite')
              setTimeout(() => setActionState('idle'), 2000)
            } else {
              setActionState('idle')
            }
          } catch (error) {
            setActionState('error')
            const message = errorMessage || 'An error occurred'
            announce(message, 'assertive')
            setTimeout(() => setActionState('idle'), 3000)
          }
        }
      },
      [onClick, loading, disabled, announceOnClick, announceMessage, announce, successMessage, errorMessage]
    )

    const isDisabled = disabled || loading || actionState === 'loading'
    const currentAriaLabel = React.useMemo(() => {
      if (actionState === 'loading') return loadingText
      if (actionState === 'success' && successMessage) return successMessage
      if (actionState === 'error' && errorMessage) return errorMessage
      return ariaLabel
    }, [actionState, loadingText, successMessage, errorMessage, ariaLabel])

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        disabled={isDisabled}
        aria-label={currentAriaLabel}
        aria-busy={actionState === 'loading'}
        aria-live={actionState !== 'idle' ? 'polite' : undefined}
        {...props}
      >
        {actionState === 'loading' ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {loadingText}
          </>
        ) : actionState === 'success' && successMessage ? (
          <>
            <svg
              className="mr-2 h-4 w-4 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            {successMessage}
          </>
        ) : actionState === 'error' && errorMessage ? (
          <>
            <svg
              className="mr-2 h-4 w-4 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            {errorMessage}
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
AccessibleButton.displayName = 'AccessibleButton'

export { AccessibleButton, buttonVariants }