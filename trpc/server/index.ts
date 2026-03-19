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

const server = createHTTPServer({
    router: appRouter,
    middleware: cors(),
    createContext(opts) {
        let authHeader = opts.req.headers["authorization"];

        if (authHeader) {
            const token = authHeader.split(' ')[1];
            console.log(token);
            return new Promise<{db: {Todo: typeof Todo, User: typeof User}, userId?: string}>((resolve) => {
                jwt.verify(token, SECRET, (err, user) => {
                    if (user) {
                        resolve({userId: user.userId as string, db: {Todo, User}});
                    } else {
                        resolve({db: {Todo, User}});
                    }
                });
            })
        }

        return {
            db: {Todo, User},
        }
    }
});
   
server.listen(3000);