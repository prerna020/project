import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../server/index';
// type-only imports are stripped at build time

// Pass AppRouter as a type parameter. This lets `trpc` know
// what procedures are available on the server and their input/output types.

const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000',
    }),
  ],
});

async function main() {
    let response = await trpc.createTodo.mutate({
        title: "go to gym",
        description: "every morning"
    })
    console.log(response)
}

main()