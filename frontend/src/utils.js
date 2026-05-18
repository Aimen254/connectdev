export function timeAgo(date) {
  const d = new Date(date)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function initials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function passwordStrength(pw) {
  if (!pw) return null
  if (pw.length < 6) return { label: 'Too short', color: 'var(--error)' }
  if (pw.length < 8) return { label: 'Weak', color: 'var(--warning)' }
  const hasNum = /\d/.test(pw)
  const hasUp  = /[A-Z]/.test(pw)
  if (hasNum && hasUp) return { label: 'Strong', color: 'var(--success)' }
  return { label: 'Fair', color: 'var(--warning)' }
}
