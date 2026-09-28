'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, ArrowRight, Loader2 } from 'lucide-react'
import { toast } from '@/lib/toast'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [minecraftName, setMinecraftName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setIsError(false)
    
    // Simple invite code validation for the Opción A
    if (inviteCode !== 'ENDERLAB2026') {
      setIsError(true)
      toast.error('Invalid invite code')
      setTimeout(() => setIsError(false), 500)
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, minecraftName })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        toast.success('Registration complete. Awaiting approval...')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setIsError(true)
        toast.error(data.error || 'Registration error')
        setTimeout(() => setIsError(false), 500)
      }
    } catch (err) {
      setIsError(true)
      toast.error('Network error')
      setTimeout(() => setIsError(false), 500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden font-sans">
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
              <UserPlus className="size-8 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Register</h1>
            <p className="text-sm text-muted-foreground mt-2">Request access to Enderlab</p>
          </div>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Panel Username"
            required
            className="w-full px-5 py-4 rounded-xl bg-black/40 border border-white/5 text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
          />
          <input
            type="text"
            value={minecraftName}
            onChange={(e) => setMinecraftName(e.target.value)}
            placeholder="Minecraft Username"
            required
            className="w-full px-5 py-4 rounded-xl bg-black/40 border border-white/5 text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full px-5 py-4 rounded-xl bg-black/40 border border-white/5 text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
          />
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="Invite Code"
            required
            className="w-full px-5 py-4 rounded-xl bg-black/40 border border-white/5 text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground hover:bg-primary/90 py-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                <span>Registering...</span>
              </>
            ) : (
              <>
                <span>Sign Up</span>
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
          
          <button 
            type="button" 
            onClick={() => router.push('/login')}
            className="text-sm text-muted-foreground hover:text-white transition-colors mt-2"
          >
            Already have an account? Sign in here
          </button>
        </form>
      </div>
    </div>
  )
}
