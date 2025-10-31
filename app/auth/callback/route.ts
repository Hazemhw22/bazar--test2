import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const cookie = cookieStore.get(name)
            return cookie ? cookie.value : undefined
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    // If session exists, ensure user profile is created
    if (session?.user && !error) {
      try {
        const profileResponse = await fetch(`${requestUrl.origin}/api/users/create-profile-service`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || 
                  session.user.user_metadata?.name || 
                  session.user.email?.split('@')[0],
            roleId: 7, // Customer role
          }),
        });

        if (!profileResponse.ok) {
          console.error('Failed to create/check user profile in callback');
        }
      } catch (error) {
        console.error('Error creating profile in callback:', error);
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/account', request.url))
}