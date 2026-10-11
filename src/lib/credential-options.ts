export const CREDENTIAL_TYPES = [
  { value: 'application', label: 'Application login' },
  { value: 'database', label: 'Database' },
  { value: 'cloud', label: 'Cloud console' },
  { value: 'server', label: 'Server / SSH' },
  { value: 'network', label: 'Network device' },
  { value: 'domain_email', label: 'Domain / email / registrar' },
  { value: 'other', label: 'Other' },
] as const

export const CREDENTIAL_ENVIRONMENTS = [
  { value: 'production', label: 'Production' },
  { value: 'staging', label: 'Staging' },
  { value: 'development', label: 'Development' },
] as const

export function credentialTypeLabel(value: string | null | undefined) {
  return CREDENTIAL_TYPES.find((t) => t.value === value)?.label || 'Other'
}

export function credentialEnvironmentLabel(value: string | null | undefined) {
  return CREDENTIAL_ENVIRONMENTS.find((e) => e.value === value)?.label || ''
}