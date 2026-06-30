// src/app/dashboard/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import axios, { AxiosError } from 'axios'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Message } from '@/src/models/User'

export default function DashboardPage() {
    const { data: session } = useSession()
    const [messages, setMessages] = useState<Message[]>([])
    const [isAccepting, setIsAccepting] = useState(true)
    const [isFetching, setIsFetching] = useState(true)
    const [isTogglingSwitch, setIsTogglingSwitch] = useState(false)

    const username = session?.user?.username

    // Fetch messages and acceptance status on mount
    const fetchData = useCallback(async () => {
        setIsFetching(true)
        try {
            const [msgsRes, statusRes] = await Promise.all([
                axios.get('/api/get-msgs'),
                axios.get('/api/accept-msgs')
            ])
            setMessages(msgsRes.data.messages || [])
            setIsAccepting(statusRes.data.isAcceptingMessage)
        } catch (err) {
            const axiosErr = err as AxiosError<{ message: string }>
            if (axiosErr.response?.status !== 404) {
                toast.error('Could not load messages')
            }
        } finally {
            setIsFetching(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])
    
    const handleToggle = async (checked: boolean) => {
        setIsTogglingSwitch(true)
        try {
            await axios.post('/api/accept-msgs', { acceptMessages: checked })
            setIsAccepting(checked)
            toast.success(checked ? 'Now accepting messages' : 'Messages paused')
        } catch {
            toast.error('Could not update setting')
        } finally {
            setIsTogglingSwitch(false)
        }
    }

  // Delete a single message
    const handleDelete = async (msgId: string) => {
        try {
            await axios.delete(`/api/delete-msg/${msgId}`)
            setMessages(prev => prev.filter((m: any) => m._id !== msgId))
            toast.success('Message deleted')
        } catch {
            toast.error('Could not delete message')
        }
    }

  // Copy the public link to clipboard
  const copyLink = () => {
    const link = `${window.location.origin}/u/${username}`
    navigator.clipboard.writeText(link)
    toast.success('Link copied!')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-medium text-gray-900">open-feedback</span>
          <button
            onClick={() => signOut({ callbackUrl: '/sign-in' })}
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Your link + copy */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Your public link</p>
          <div className="flex items-center justify-between gap-3">
            <code className="text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded-md flex-1 truncate">
              {typeof window !== 'undefined' ? `${window.location.origin}/u/${username}` : `…/u/${username}`}
            </code>
            <Button variant="outline" size="sm" onClick={copyLink}>
              Copy
            </Button>
          </div>
        </div>

        {/* Accept messages toggle */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 text-sm">Accept messages</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {isAccepting ? 'People can send you messages' : 'New messages are blocked'}
            </p>
          </div>
          <Switch
            checked={isAccepting}
            onCheckedChange={handleToggle}
            disabled={isTogglingSwitch}
          />
        </div>

        <Separator />

        {/* Messages */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-gray-900">
              Messages <span className="text-gray-400 font-normal">({messages.length})</span>
            </h2>
            <Button variant="ghost" size="sm" onClick={fetchData}>
              Refresh
            </Button>
          </div>

          {isFetching ? (
            // Skeleton placeholders while loading
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
              <p className="text-gray-500 text-sm">No messages yet.</p>
              <p className="text-gray-400 text-xs mt-1">Share your link to start receiving them.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg: any) => (
                <div
                  key={msg._id}
                  className="bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 text-sm leading-relaxed">{msg.content}</p>
                    <p className="text-gray-400 text-xs mt-2">
                      {new Date(msg.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(msg._id)}
                    className="text-gray-300 hover:text-red-400 transition-colors shrink-0 text-lg leading-none"
                    aria-label="Delete message"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}