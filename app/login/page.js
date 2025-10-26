'use client'

import { Auth } from '@supabase/auth-ui-react'
import { supabase } from '@/lib/supabase'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) router.push('/')
    })

    return () => subscription.unsubscribe()
  }, [router])

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="p-6 rounded-xl shadow-lg w-full max-w-md bg-white">
        <Auth
          supabaseClient={supabase}
          providers={[]}             // removes OAuth buttons
          appearance={{
            style: {
              oauth: { display: 'none' } // hides the OAuth container completely
            }
          }}
        />
      </div>
    </div>
  )
}
