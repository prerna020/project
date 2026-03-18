import { router, publicProcedure } from "./trpc";
import {z} from "zod";
import { createHTTPServer } from '@trpc/server/adapters/standalone';
// @ts-ignore
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
export const SECRET = 'SECr3t';
import cors from "cors";
import { userRouter } from "./router/user";
import { todoRouter } from "./router/todo";


export const appRouter = router({
    user: userRouter, 
    todo: todoRouter
})

export type AppRouter = typeof appRouter
