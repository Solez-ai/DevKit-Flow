import { useAccessibility } from '@/hooks/use-accessibility'

export function AccessibilityAnnouncer() {
  const { announcements } = useAccessibility()

  return (
    <>
      {announcements.map((announcement, index) => (
        <div
          key={index}
          aria-live={announcement.priority}
          aria-atomic="true"
          className="sr-only"
        >
          {announcement.message}
        </div>
      ))}
    </>
  )
}