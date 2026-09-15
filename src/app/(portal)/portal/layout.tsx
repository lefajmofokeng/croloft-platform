import LogoutButton from '@/components/logout-button'
import Link from 'next/link'

const navItems = [
  { label: 'Dashboard', href: '/portal' },
  { label: 'Quotes', href: '/portal/quotes' },
  { label: 'Invoices', href: '/portal/invoices' },
  { label: 'Support', href: '/portal/support' },
]

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r bg-gray-900 text-white">
        <div className="border-b border-gray-800 p-4 font-semibold">
          Client Console
        </div>
        <nav className="p-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded px-3 py-2 text-sm hover:bg-gray-800"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1">
        <div className="flex items-center justify-end border-b p-4">
          <LogoutButton />
        </div>
        <main>{children}</main>
      </div>
    </div>
  )
}