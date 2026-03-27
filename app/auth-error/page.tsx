'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ErrorContent() {
  const params = useSearchParams()
  const error = params.get('error')

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090b] p-6">
      <div className="max-w-md rounded-xl border border-red-500/30 bg-zinc-900 p-8 text-center">
        <h1 className="text-2xl font-bold text-red-400 mb-4">Auth Error</h1>
        <p className="text-zinc-300 mb-2">Error code: <code className="text-red-300">{error || 'unknown'}</code></p>
        <p className="text-sm text-zinc-500 mt-4">
          {error === 'OAuthCallbackError' && 'GitHub OAuth callback failed. Check client ID/secret.'}
          {error === 'Configuration' && 'NextAuth configuration error. Check env vars.'}
          {error === 'OAuthAccountNotLinked' && 'Account already exists with different provider.'}
          {error === 'Callback' && 'Error in signIn callback (likely database issue).'}
          {!error && 'Unknown auth error.'}
        </p>
        <a href="/" className="mt-6 inline-block rounded-lg bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-500">
          Back to home
        </a>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#09090b]"><p className="text-zinc-400">Loading...</p></div>}>
      <ErrorContent />
    </Suspense>
  )
}
