'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios, { AxiosError } from 'axios'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { verifySchema } from '@/src/schemas/verifySchema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type VerifyFormData = z.infer<typeof verifySchema>

export default function VerifyPage() {
  const router = useRouter()
  const params = useParams<{ username: string }>()  // reads [username] from URL
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: '' }
  })

  const onSubmit = async (data: VerifyFormData) => {
    setIsSubmitting(true)
    try {
      const res = await axios.post('/api/verify-code', {
        username: params.username,
        code: data.code
      })
      toast.success(res.data.message)
      router.push('/sign-in')
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>
      toast.error(axiosErr.response?.data?.message || 'Verification failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Verify your email</h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter the 6-digit code sent to your email.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="code">Verification code</Label>
            <Input
              id="code"
              placeholder="482910"
              maxLength={6}
              {...register('code')}
            />
            {errors.code && (
              <p className="text-xs text-red-500">{errors.code.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Verifying...' : 'Verify'}
          </Button>
        </form>
      </div>
    </div>
  )
}