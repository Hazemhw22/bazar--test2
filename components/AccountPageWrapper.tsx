"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AccountPageWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [sessionChecked, setSessionChecked] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.replace("/auth") // إعادة التوجيه إذا لم يكن هناك session
      } else {
        setSessionChecked(true)
      }
      setLoading(false)
    }
    checkSession()
  }, [router])

  if (loading) return <p>Loading...</p>
  if (!sessionChecked) return null

  return <>{children}</>
}
