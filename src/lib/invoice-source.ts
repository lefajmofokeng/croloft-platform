export const INVOICE_SOURCES = [
  { value: 'project_conversion', label: 'Project conversion' },
  { value: 'external_project', label: 'External project' },
  { value: 'once_off_service', label: 'Once-off service' },
  { value: 'retainer', label: 'Retainer / subscription' },
  { value: 'other', label: 'Other' },
] as const

export function invoiceSourceLabel(value: string | null | undefined) {
  return INVOICE_SOURCES.find((s) => s.value === value)?.label || 'Other'
}