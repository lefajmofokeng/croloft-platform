'use client'

import ConfirmSubmitButton from '@/components/confirm-submit-button'
import { deleteProduct } from './actions'

export default function DeleteProductButton({ productId, categoryId }: { productId: string; categoryId: string }) {
  return (
    <ConfirmSubmitButton
      action={deleteProduct}
      hiddenFields={{ id: productId, category_id: categoryId }}
      buttonLabel="Delete Product"
      buttonClassName="rounded border border-red-600 px-4 py-2 text-red-600 hover:bg-red-50"
      confirmTitle="Delete this product?"
      confirmMessage="This will also delete ALL its add-ons and options. This cannot be undone."
    />
  )
}