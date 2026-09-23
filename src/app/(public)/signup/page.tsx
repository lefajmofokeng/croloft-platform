'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo',
  'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape',
]

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+']

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [province, setProvince] = useState('')
  const [accountType, setAccountType] = useState<'individual' | 'business'>('individual')
  const [industry, setIndustry] = useState('')
  const [companySize, setCompanySize] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

    async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Clear any existing session first, so a new signup never inherits
    // a previously logged-in account's session
    await supabase.auth.signOut()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          province,
          account_type: accountType,
          industry: accountType === 'business' ? industry : null,
          company_size: accountType === 'business' ? companySize : null,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/portal')
    router.refresh()
  }

    async function handleGoogleLogin() {
        await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
        },
        })
    }

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <form onSubmit={handleSignup} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Create your Croloft account</h1>

        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Province</label>
          <select
            required
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 p-2"
          >
            <option value="">Select province</option>
            {PROVINCES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Account Type</label>
          <div className="mt-1 flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={accountType === 'individual'}
                onChange={() => setAccountType('individual')}
              />
              Individual
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={accountType === 'business'}
                onChange={() => setAccountType('business')}
              />
              Business
            </label>
          </div>
        </div>

        {accountType === 'business' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Industry</label>
              <input
                type="text"
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Retail, Healthcare, Finance"
                className="mt-1 w-full rounded border border-gray-300 p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Size</label>
              <select
                required
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 p-2"
              >
                <option value="">Select size</option>
                {COMPANY_SIZES.map((s) => (
                  <option key={s} value={s}>{s} employees</option>
                ))}
              </select>
            </div>
          </>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 p-2 text-white disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline">Log in</a>
        </p>
      </form>

              <div className="relative py-2 text-center text-sm text-gray-400">
          <span className="bg-white px-2">or</span>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full rounded border border-gray-300 p-2 text-sm font-medium hover:bg-gray-50"
        >
          Continue with Google
        </button>
    </div>
  )
}