'use client'

import { useEffect, useState } from 'react'
import { useDebounceCallback } from 'usehooks-ts'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios, { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { signUpSchema } from '@/src/schemas/signUp'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'


export default function SignUpPage() {
    const router = useRouter()
    const [usernameMessage, setUsernameMessage] = useState('')   // message from username-unique API
    const [isCheckingUsername, setIsCheckingUsername] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {
        register,
        watch,
        handleSubmit,
        formState: { errors }
    }  = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: { username: '', email: '', password: '' }
    })

    // watch() subscribes to that field's value in real time
    const username = watch('username')

    // useDebounceCallback: waits 500ms after last call before running
    const checkUsername = useDebounceCallback(async (uname: string) => {
        if (!uname || uname.length < 2) {
            setUsernameMessage('')
            return
        }
        setIsCheckingUsername(true)
        try {
            const res = await axios.get(`/api/username-unique?username=${uname}`)
            console.log(res)
            setUsernameMessage(res.data.message)
        } catch (err) {
            const axiosErr = err as AxiosError<{ message: string }>
            setUsernameMessage(axiosErr.response?.data?.message || 'Error checking username')
        } finally {
            setIsCheckingUsername(false)
        }
    }, 500)

    // Trigger the debounced check whenever username changes
    useEffect(() => {
        checkUsername(username)
    }, [username])

    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
        setIsSubmitting(true)
        try {
            const res = await axios.post('/api/sign-up', data)
            console.log("response for data 2- ", res)
            toast.success(res.data.message || 'Account created! Check your email.')
            // Redirect to verify page with their username
            router.push(`/verify/${data.username}`)
        } catch (err) {
            const axiosErr = err as AxiosError<{ message: string }>
            toast.error(axiosErr.response?.data?.message || 'Sign up failed')
        } finally {
            setIsSubmitting(false)
        }
    }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1 text-center">Create account</h1>
        <p className="text-m text-gray-500 mb-6 text-center">
          Get your anonymous message link
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
         
          <div className="space-y-1">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="your-username"
              {...register('username')}
            />
            {/* Real-time feedback under username field */}
            {isCheckingUsername && (
              <p className="text-xs text-gray-400">Checking...</p>
            )}
            {!isCheckingUsername && usernameMessage && (
              <p className={`text-xs ${
                usernameMessage === 'username is available'
                  ? 'text-green-600'
                  : 'text-red-500'
              }`}>
                {usernameMessage}
              </p>
            )}
            {errors.username && (
              <p className="text-xs text-red-500">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min 6 characters"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-4">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-gray-900 underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}