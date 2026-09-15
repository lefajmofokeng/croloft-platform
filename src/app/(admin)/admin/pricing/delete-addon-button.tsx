'use client'

import ConfirmSubmitButton from '@/components/confirm-submit-button'
import { deleteAddon } from './actions'

export default function DeleteAddonButton({ addonId, productId }: { addonId: string; productId: string }) {
  return (
    <ConfirmSubmitButton
      action={deleteAddon}
      hiddenFields={{ id: addonId, product_id: productId }}
      buttonLabel="Delete Add-on"
      buttonClassName="rounded border border-red-600 px-4 py-2 text-red-600 hover:bg-red-50"
      confirmTitle="Delete this add-on?"
      confirmMessage="This will also delete all its options. This cannot be undone."
    />
  )
}