import LogoutButton from '@/components/logout-button'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PortalSearchBox from '../portal-search-box'

const navItems = [
  { label: 'Dashboard', href: '/portal' },
  { label: 'Projects', href: '/portal/projects' },
  { label: 'Get a Quote', href: '/portal/pricing' },
  { label: 'Quotes', href: '/portal/quotes' },
  { label: 'Invoices', href: '/portal/invoices' },
  { label: 'Support', href: '/portal/support' },
]

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user!.id)
    .single()

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
        <div className="flex items-center justify-between border-b p-4">
          <PortalSearchBox />
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {profile?.full_name || profile?.email}
            </span>
            <LogoutButton />
          </div>
        </div>
        <main>{children}</main>
      </div>
    </div>
  )
}