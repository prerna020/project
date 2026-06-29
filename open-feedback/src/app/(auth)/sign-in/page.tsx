'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { signInSchema } from '@/src/schemas/signIn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type SignInFormData = z.infer<typeof signInSchema>

export default function SignInPage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm<SignInFormData>({
        resolver: zodResolver(signInSchema),
        defaultValues: { identifier: '', password: '' }
    })

    const onSubmit = async (data: SignInFormData) => {
        setIsSubmitting(true)

        // signIn() from next-auth/react — not axios
        // redirect: false means it won't auto-redirect, gives you the result object
        const result = await signIn('credentials', {
            identifier: data.identifier,
            password: data.password,
            redirect: false,   // handle redirect yourself
        })

        setIsSubmitting(false)

        if (result?.error) {
            toast.error('Invalid credentials. Check email/username and password.')
            return
        }

        if (result?.ok) {
            toast.success('Signed in!')
            router.push('/dashboard')
            router.refresh()  // forces Next.js to re-fetch server data with new session
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 p-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">Sign in</h1>
                <p className="text-sm text-gray-500 mb-6">
                    Use your username or email
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1">
                    <Label htmlFor="identifier">Username or email</Label>
                    <Input
                        id="identifier"
                        placeholder="prerna or you@example.com"
                        {...register('identifier')}
                    />
                    {errors.identifier && (
                        <p className="text-xs text-red-500">{errors.identifier.message}</p>
                    )}
                </div>

                <div className="space-y-1">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Your password"
                        {...register('password')}
                    />
                    {errors.password && (
                        <p className="text-xs text-red-500">{errors.password.message}</p>
                    )}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Signing in...' : 'Sign in'}
                </Button>
                </form>

                <p className="text-sm text-center text-gray-500 mt-4">
                No account?{' '}
                <Link href="/sign-up" className="text-gray-900 underline underline-offset-2">
                    Sign up
                </Link>
                </p>
            </div>
        </div>
  )
}