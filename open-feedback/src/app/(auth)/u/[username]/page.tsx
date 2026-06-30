'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios, { AxiosError } from 'axios'
import { toast } from 'sonner'
import { messageSchema } from '@/src/schemas/messageSchema'
import { Button } from '@/components/ui/button'

type MessageFormData = z.infer<typeof messageSchema>

export default function PublicPage() {
  const params = useParams<{ username: string }>()
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isSuggesting, setIsSuggesting] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: { content: '' }
  })

  const content = watch('content')

  const onSubmit = async (data: MessageFormData) => {
    setIsSending(true)
    try {
      await axios.post('/api/send-msgs', {
        username: params.username,
        content: data.content
      })
      setSent(true)
      reset()
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>
      toast.error(axiosErr.response?.data?.message || 'Could not send message')
    } finally {
      setIsSending(false)
    }
  }

  const getSuggestions = async () => {
    setIsSuggesting(true)
    setSuggestions([])

    try {
      // AI endpoint returns a stream — use fetch, not axios
      // axios doesn't handle streams easily
      const response = await fetch('/api/suggest-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (!response.body) return

      // ReadableStream API — reads the response chunk by chunk as it arrives
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        // Decode the chunk (Uint8Array → string) and append
        fullText += decoder.decode(value, { stream: true })
      }

      // Backend returns "question1||question2||question3"
      // Split by || and clean up
      const parsed = fullText
        .split('||')
        .map(s => s.trim())
        .filter(s => s.length > 0)

      setSuggestions(parsed)
    } catch {
      toast.error('Could not get suggestions')
    } finally {
      setIsSuggesting(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-2xl mb-2">✓</p>
          <p className="text-gray-900 font-medium">Message sent</p>
          <p className="text-gray-400 text-sm mt-1">It was delivered anonymously.</p>
          <button
            onClick={() => setSent(false)}
            className="mt-4 text-sm text-gray-500 underline underline-offset-2"
          >
            Send another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-4">

        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-gray-900">
            Send a message to @{params.username}
          </h1>
          <p className="text-sm text-gray-400 mt-1">Anonymous. They won't know it's you.</p>
        </div>

        {/* AI suggestions */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Need ideas?</p>
            <Button
              variant="outline"
              size="sm"
              onClick={getSuggestions}
              disabled={isSuggesting}
            >
              {isSuggesting ? 'Thinking...' : 'Suggest messages'}
            </Button>
          </div>

          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setValue('content', s)}  // clicking fills the textarea
                  className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {suggestions.length === 0 && !isSuggesting && (
            <p className="text-xs text-gray-300">Click the button to get AI-generated prompts</p>
          )}
        </div>

        {/* Message form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 p-1">
            <textarea
              {...register('content')}
              placeholder="Write your message here..."
              rows={5}
              className="w-full px-4 pt-3 pb-2 text-sm text-gray-800 placeholder-gray-300 resize-none focus:outline-none rounded-xl"
            />
            <div className="flex items-center justify-between px-3 pb-2">
              <span className={`text-xs ${
                (content?.length || 0) > 280 ? 'text-red-400' : 'text-gray-300'
              }`}>
                {content?.length || 0}/300
              </span>
              <Button type="submit" size="sm" disabled={isSending}>
                {isSending ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>

          {errors.content && (
            <p className="text-xs text-red-500 px-1">{errors.content.message}</p>
          )}
        </form>
      </div>
    </div>
  )
}