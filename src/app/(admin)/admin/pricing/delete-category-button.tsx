'use client'

import ConfirmSubmitButton from '@/components/confirm-submit-button'
import { deleteCategory } from './actions'

export default function DeleteCategoryButton({ categoryId }: { categoryId: string }) {
  return (
    <ConfirmSubmitButton
      action={deleteCategory}
      hiddenFields={{ id: categoryId }}
      buttonLabel="Delete Category"
      buttonClassName="rounded border border-red-600 px-4 py-2 text-red-600 hover:bg-red-50"
      confirmTitle="Delete this category?"
      confirmMessage="This will also delete ALL its products, add-ons, and options. This cannot be undone."
    />
  )
}