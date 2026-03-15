import { router, publicProcedure } from "./trpc";
import {z} from "zod";
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
})

const server = createHTTPServer({
  router: appRouter,
});
 
server.listen(3000);

export type AppRouter = typeof appRouter

/*
app cant send real code 
how frontend what to endpoints exists  
type - This creates a type-only description — like a blueprint with no actual code:


typeof appRouter extracts THIS information:     
                                                
{                                               
list:                                         
    input: void (nothing)                       
    output: { id: number, task: string, done: boolean }[]                 
                                                
add:                                          
    input: { task: string }                     
    output: { id: number, task: string,done: boolean }                   
                                                
toogle:                                       
    input: { id: number }                       
    output: { id: number, task: string, done: boolean } | undefined       
                                                
remove:                                       
    input: { id: number }                       
    output: { success: boolean }                
}
*/