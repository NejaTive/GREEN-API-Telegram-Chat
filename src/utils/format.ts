export function formatPhone(value: string): string {
  return value.replace(/\D/g, '')
}

export function avatarLetter(name: string): string {
  const clean = name.replace(/^[@+]/, '')
  return (clean[0] || '?').toUpperCase()
}

export function formatTime(timestamp: number): string {
  const ms = timestamp < 1e12 ? timestamp * 1000 : timestamp
  return new Date(ms).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}
