export function veiBucket(vei) {
  if (vei === null || vei === undefined) return 'unknown'
  if (vei <= 2) return 'low'
  if (vei <= 4) return 'mid'
  if (vei <= 6) return 'high'
  return 'extreme'
}
