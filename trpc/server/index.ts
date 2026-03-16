import { router, publicProcedure } from "./trpc";
import {email, z} from "zod";
import { createHTTPServer } from '@trpc/server/adapters/standalone';


// query -> just reads the data, can't change anything (get)
// mutation -> can change data (post, put, delete)

const todoInputType = z.object({
    title: z.string(),
    description: z.string()
})


export const appRouter = router({
    createTodo: publicProcedure
        .input(todoInputType)
        .mutation(async(opts)=>{
            console.log("hi");
            const title = opts.input.title
            const description = opts.input.description

            // db

            return {
                id:"1"
            }
        }),

    signup: publicProcedure
        .input(z.object({
            email: z.string(),
            password: z.string()
        }))
        .mutation(async (opts)=>{
            let email = opts.input.email
            let password = opts.input.password

            // db

            let token = "1234124"
            return {
                token
            }
        } )
})

const server = createHTTPServer({
  router: appRouter,
  createContext(opts){
    let authHeader = opts.req.headers["authorization"]
    console.log(authHeader)
    // jwt verify()
    return {
        username : "xyz"
    }
  }
});
 
server.listen(3000);

export type AppRouter = typeof appRouter
