export function formatRelativeTime(input: number, locale: string): string {
  if (!Number.isFinite(input)) return ''
  const now = Date.now()
  const diff = input - now
  const absS = Math.abs(diff) / 1000
  const f = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  if (absS < 60) return f.format(Math.round(diff / 1e3), 'second')
  if (absS < 3600) return f.format(Math.round(diff / 6e4), 'minute')
  if (absS < 86400) return f.format(Math.round(diff / 3.6e6), 'hour')
  if (absS < 604800) return f.format(Math.round(diff / 8.64e7), 'day')
  if (absS < 2592000) return f.format(Math.round(diff / 6.048e8), 'week')
  const d = new Date(input)
  const sameYear = d.getFullYear() === new Date(now).getFullYear()
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  }).format(d)
}
