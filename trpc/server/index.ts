import { router, publicProcedure } from "./trpc";
import {email, z} from "zod";
import { createHTTPServer } from '@trpc/server/adapters/standalone';

export const appRouter = router({
    
})

export type AppRouter = typeof appRouter
