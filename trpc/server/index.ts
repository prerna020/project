import { router, publicProcedure } from "./trpc";
import {z} from "zod";
import { createHTTPServer } from '@trpc/server/adapters/standalone';


// query -> just reads the data, can't change anything (get)
// mutation -> can change data (post, put, delete)

type Todo = {id: number, task: string,description: string, done: boolean}
let todos: Todo[] = []
let nextId= 1;
console.log("hi")
export const appRouter = router({
    // get all todo
    list: publicProcedure.query(()=>{
        return todos
    }),

    // add todo
    add: publicProcedure
        .input(z.object({task: z.string().min(1), description: z.string()})) // validate input
        .mutation(({input}) => {
            const todo = {id: nextId++, task: input.task,description: input.description, done: false};
            todos.push(todo);
            return todo
        }),
    
    toogle: publicProcedure
        .input(z.object({id: z.number()}))
        .mutation(({input})=>{
            // 1. finding todo with id == input.id
            const todo = todos.find(t => t.id === input.id);
            if (todo) todo.done = !todo.done;
            return todo;
        }),
    
    remove: publicProcedure
        .input(z.object({id: z.number()}))
        .mutation(({ input }) => {
            todos = todos.filter(t => t.id !== input.id);
            return { success: true };
        })
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