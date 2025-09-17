'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestPage() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient()
        
        // 세션 확인
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Session exists:', !!session)
        
        // 직접 쿼리
        const { data: influencers, error: fetchError } = await supabase
          .from('influencers')
          .select('*')
          .limit(5)
        
        console.log('Raw response:', { data: influencers, error: fetchError })
        
        if (fetchError) {
          setError(fetchError)
        } else {
          setData(influencers)
        }
      } catch (err) {
        console.error('Catch error:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {JSON.stringify(error, null, 2)}</div>
  
  return (
    <div>
      <h1>Test Data</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}