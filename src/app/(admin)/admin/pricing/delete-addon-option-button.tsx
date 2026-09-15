'use client'

import ConfirmSubmitButton from '@/components/confirm-submit-button'
import { deleteAddonOption } from './actions'

export default function DeleteAddonOptionButton({ optionId, addonId }: { optionId: string; addonId: string }) {
  return (
    <ConfirmSubmitButton
      action={deleteAddonOption}
      hiddenFields={{ id: optionId, addon_id: addonId }}
      buttonLabel="Delete"
      buttonClassName="rounded border border-red-600 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
      confirmTitle="Delete this option?"
      confirmMessage="This cannot be undone."
    />
  )
}