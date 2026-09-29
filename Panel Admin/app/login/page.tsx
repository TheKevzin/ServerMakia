'use client'

import { useState } from 'react'
import { Lock, ArrowRight, Loader2 } from 'lucide-react'
import { toast } from '@/lib/toast'

export default function LoginPage() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setIsError(false)
    
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() || 'admin', password })
      })
      
      if (res.ok) {
        toast.success('Access authorized. Redirecting...')
        window.location.href = '/' // Force hard redirect
      } else {
        setIsError(true)
        toast.error('Invalid credentials')
        setPassword('')
        setTimeout(() => setIsError(false), 500)
      }
    } catch (err) {
      setIsError(true)
      toast.error('Network or connection error')
      setTimeout(() => setIsError(false), 500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[140px] animate-pulse duration-10000" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[140px] animate-pulse duration-10000 delay-1000" />
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div 
        className={`glass w-full max-w-md rounded-3xl p-10 relative z-10 border border-white/10 shadow-2xl transition-transform ${
          isError ? 'animate-shake' : ''
        }`}
      >
        <div className="flex flex-col items-center justify-center text-center gap-4 mb-8">
          <div className="relative group">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary to-primary/60 opacity-50 blur group-hover:opacity-100 transition duration-500"></div>
            <div className="relative size-16 rounded-2xl bg-background/80 backdrop-blur-sm border border-white/10 flex items-center justify-center">
              <Lock className="size-8 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">ServerMakia</h1>
            <p className="text-sm text-muted-foreground mt-2">Server Control Panel</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full px-5 py-4 rounded-xl bg-black/40 border border-white/5 text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50 mb-4"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className="w-full px-5 py-4 rounded-xl bg-black/40 border border-white/5 text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground hover:bg-primary/90 py-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
