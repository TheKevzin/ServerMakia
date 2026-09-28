'use client'

import { useState, useEffect } from 'react'
import { Trash2, UserPlus, Shield, User, CheckCircle2 } from 'lucide-react'
import { toast } from '@/lib/toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type PanelUser = {
  id: string
  username: string
  name: string
  role: string
  status: string
  minecraftName?: string
}

export function UsersView() {
  const [users, setUsers] = useState<PanelUser[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newName, setNewName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState('VIEWER')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        setUsers(await res.json())
      }
    } catch (e) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUsername || !newPassword) return

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, password: newPassword, name: newName, newRole })
      })

      if (res.ok) {
        toast.success('User added successfully')
        setIsAdding(false)
        setNewUsername('')
        setNewPassword('')
        setNewName('')
        setNewRole('VIEWER')
        fetchUsers()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to add user')
      }
    } catch (e) {
      toast.error('Network error')
    }
  }

  const handleDeleteUser = async (id: string, username: string) => {
    if (username === 'admin') {
      toast.error('Cannot delete the root admin account')
      return
    }
    if (!confirm(`Are you sure you want to delete ${username}?`)) return

    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      if (res.ok) {
        toast.success('User deleted')
        fetchUsers()
      } else {
        toast.error('Failed to delete user')
      }
    } catch (e) {
      toast.error('Network error')
    }
  }

  const handleApproveUser = async (id: string, username: string) => {
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'APPROVED' })
      })

      if (res.ok) {
        toast.success(`${username} approved and whitelisted!`)
        fetchUsers()
      } else {
        toast.error('Failed to approve user')
      }
    } catch (e) {
      toast.error('Network error')
    }
  }

  const handleChangeRole = async (id: string, newRole: string) => {
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role: newRole })
      })

      if (res.ok) {
        toast.success(`Role updated to ${newRole}`)
        fetchUsers()
      } else {
        toast.error('Failed to update role')
      }
    } catch (e) {
      toast.error('Network error')
    }
  }

  if (loading) {
    return <div className="p-10 text-center text-muted-foreground animate-pulse">Loading users...</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="glass flex items-center justify-between rounded-3xl p-6">
        <div>
          <h2 className="text-lg font-bold text-foreground font-heading">Panel Accounts</h2>
          <p className="text-sm text-muted-foreground">Manage who can access and control the web panel.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-end-stone transition-all hover:bg-primary/80"
        >
          <UserPlus className="size-4" />
          {isAdding ? 'Cancel' : 'New User'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddUser} className="glass grid gap-4 rounded-3xl p-6 md:grid-cols-2 lg:grid-cols-5">
          <input
            type="text"
            placeholder="Username *"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm focus:border-primary/50 focus:outline-none"
            required
          />
          <input
            type="text"
            placeholder="Display Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm focus:border-primary/50 focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password *"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm focus:border-primary/50 focus:outline-none"
            required
          />
          <Select value={newRole} onValueChange={setNewRole}>
            <SelectTrigger className="rounded-xl border border-white/10 bg-black/40 h-10 px-4 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent className="bg-[#0b0c10] border-border text-foreground">
              <SelectItem value="VIEWER" className="focus:bg-white/10 cursor-pointer">Viewer (Read Only)</SelectItem>
              <SelectItem value="MODERATOR" className="focus:bg-amber-500/20 text-amber-400 cursor-pointer">Moderator (Console & Players)</SelectItem>
              <SelectItem value="ADMIN" className="focus:bg-primary/20 text-primary cursor-pointer">Admin (Full Access)</SelectItem>
            </SelectContent>
          </Select>
          <button type="submit" className="rounded-xl bg-emerald-500/20 text-emerald-400 font-bold hover:bg-emerald-500/30 transition-all border border-emerald-500/30">
            Create
          </button>
        </form>
      )}

      <div className="glass rounded-3xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/20 border-b border-border/50 text-muted-foreground">
            <tr>
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {users.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-white/5">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {user.minecraftName ? (
                      <img src={`https://mc-heads.net/avatar/${user.minecraftName}`} alt={user.minecraftName} className="size-10 rounded-xl" />
                    ) : (
                      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
                        <User className="size-5" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-foreground">{user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.minecraftName ? `MC: ${user.minecraftName}` : (user.name || 'No display name')}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${
                    user.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    <span className={`size-1.5 rounded-full ${user.status === 'APPROVED' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Select value={user.role} onValueChange={(val: string) => handleChangeRole(user.id, val)}>
                    <SelectTrigger className={`inline-flex h-auto w-[120px] items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer ${
                      user.role === 'ADMIN' ? 'bg-primary/20 text-primary border-primary/30' :
                      user.role === 'MODERATOR' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                      'bg-slate-500/20 text-slate-300 border-slate-500/30'
                    }`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0b0c10] border-border text-foreground">
                      <SelectItem value="VIEWER" className="focus:bg-white/10 cursor-pointer">VIEWER</SelectItem>
                      <SelectItem value="MODERATOR" className="focus:bg-amber-500/20 text-amber-400 cursor-pointer">MODERATOR</SelectItem>
                      <SelectItem value="ADMIN" className="focus:bg-primary/20 text-primary cursor-pointer">ADMIN</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {user.status === 'PENDING' && (
                      <button
                        onClick={() => handleApproveUser(user.id, user.username)}
                        className="rounded-lg p-2 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                        title="Approve User"
                      >
                        <CheckCircle2 className="size-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/20 hover:text-rose-400 transition-colors"
                      title="Delete User"
                      aria-label="Delete User"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
