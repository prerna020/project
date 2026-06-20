import {z} from 'zod'


export const messageAcceptingSchema = z.object({
    acceptMessage: z.boolean()
})