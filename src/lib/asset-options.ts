export const ASSET_TYPES = [
  { value: 'pc_laptop', label: 'PC / Laptop' },
  { value: 'server', label: 'Server' },
  { value: 'router', label: 'Router' },
  { value: 'switch', label: 'Switch' },
  { value: 'printer', label: 'Printer' },
  { value: 'other', label: 'Other' },
] as const

export const ASSET_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'in_repair', label: 'In Repair' },
  { value: 'retired', label: 'Retired' },
] as const

export function assetTypeLabel(value: string | null | undefined) {
  return ASSET_TYPES.find((t) => t.value === value)?.label || 'Other'
}

export function assetStatusLabel(value: string | null | undefined) {
  return ASSET_STATUSES.find((s) => s.value === value)?.label || 'Active'
}