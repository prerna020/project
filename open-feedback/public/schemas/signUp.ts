import {email, z} from 'zod'

export const usernameValidation = z
    .string()
    .min(2, "Username must be atleast 2 characters")
    .regex(/^[a-zA-Z][a-zA-Z0-9_]{2,19}$/, "Enter valid username")

export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email({message:"Enter valid email"}),
    password: z.string().min(6, {message:"Must be at least 6 characters"})
})