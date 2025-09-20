'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ApiTestPage() {
  const [username, setUsername] = useState('cristiano')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testProfile = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ig/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      })
      const data = await res.json()
      setResult({ status: res.status, data })
    } catch (error) {
      setResult({ error: String(error) })
    }
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Instagram API 테스터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Instagram username"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setUsername('cristiano')}>cristiano</Button>
              <Button onClick={() => setUsername('nike')}>nike</Button>
              <Button onClick={() => setUsername('samsung')}>samsung</Button>
            </div>
            <Button 
              onClick={testProfile} 
              disabled={loading}
              className="w-full"
            >
              {loading ? '테스트 중...' : '프로필 테스트'}
            </Button>
            
            {result && (
              <pre className="bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}