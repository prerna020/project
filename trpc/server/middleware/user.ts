import { TRPCError } from '@trpc/server';
import { middleware } from "../trpc";

export const isLoggedIn = middleware(async (opts) => {
    const { ctx } = opts;
    if (!ctx.userId) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    let user = await ctx.db.User.findOne({
        //@ts-ignore
        username: ctx.userId
    })
    return opts.next({
      ctx: {
        user
      },
    });
  });
