import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SkipLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const target = document.querySelector(href) as HTMLElement
    if (target) {
      target.focus()
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      className={cn(
        // Hidden by default, visible on focus
        'absolute left-4 top-4 z-50',
        'translate-y-[-100%] opacity-0',
        'focus:translate-y-0 focus:opacity-100',
        'transition-all duration-200',
        'bg-background border-2 border-primary',
        'text-primary font-medium',
        className
      )}
    >
      {children}
    </Button>
  )
}

export function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <SkipLink href="#sidebar-navigation" className="left-32">
        Skip to navigation
      </SkipLink>
      <SkipLink href="#header-actions" className="left-60">
        Skip to header actions
      </SkipLink>
    </div>
  )
}