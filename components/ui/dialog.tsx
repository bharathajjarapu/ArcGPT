import * as React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

export interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export interface DialogContentProps {
  className?: string
  children: React.ReactNode
  onClose?: () => void
}

export interface DialogHeaderProps {
  className?: string
  children: React.ReactNode
}

export interface DialogFooterProps {
  className?: string
  children: React.ReactNode
}

export interface DialogTitleProps {
  className?: string
  children: React.ReactNode
}

export interface DialogDescriptionProps {
  className?: string
  children: React.ReactNode
}

const DialogContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
} | null>(null)

const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  ({ open, onOpenChange, children, ...props }, ref) => {
    const [internalOpen, setInternalOpen] = React.useState(false)
    const currentOpen = open !== undefined ? open : internalOpen
    const handleOpenChange = onOpenChange || setInternalOpen

    const contextValue = {
      open: currentOpen,
      onOpenChange: handleOpenChange,
    }

    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && currentOpen) {
          handleOpenChange(false)
        }
      }

      if (currentOpen) {
        document.addEventListener('keydown', handleEscape)
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'unset'
      }

      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = 'unset'
      }
    }, [currentOpen, handleOpenChange])

    return (
      <DialogContext.Provider value={contextValue}>
        <div ref={ref} {...props}>
          {children}
        </div>
      </DialogContext.Provider>
    )
  }
)
Dialog.displayName = "Dialog"

const DialogTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ children, onClick, ...props }, ref) => {
    const context = React.useContext(DialogContext)
    if (!context) throw new Error("DialogTrigger must be used within Dialog")

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => {
          context.onOpenChange(true)
          onClick?.()
        }}
        {...props}
      >
        {children}
      </button>
    )
  }
)
DialogTrigger.displayName = "DialogTrigger"

const DialogOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, onClick, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 bg-black/80",
        className
      )}
      onClick={onClick}
      {...props}
    />
  )
)
DialogOverlay.displayName = "DialogOverlay"

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, onClose, ...props }, ref) => {
    const context = React.useContext(DialogContext)
    if (!context) throw new Error("DialogContent must be used within Dialog")

    if (!context.open) return null

    const handleClose = () => {
      context.onOpenChange(false)
      onClose?.()
    }

    return (
      <>
        <DialogOverlay onClick={handleClose} />
        <div
          ref={ref}
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg",
            className
          )}
          {...props}
        >
          {children}
          <button
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      </>
    )
  }
)
DialogContent.displayName = "DialogContent"

const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, children, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  )
)
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  )
)
DialogDescription.displayName = "DialogDescription"

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
