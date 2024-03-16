import { initTRPC, TRPCError } from '@trpc/server';

// TODO: add auth
interface Context {
  //user?: UserFromToken;
}

const t = initTRPC.context<Context>().create();
const middleware = t.middleware;

const isAuthed = middleware(async opts => {
  /*const user = await getUser();
  if (!user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }*/

  return opts.next({
    ctx: {
      //user: user,
    },
  });
});

const logErrors = middleware(async opts => {
  const res = await opts.next();
  if (!res.ok) {
    console.error('TRPC procedure error.', res.error);
  }
  // Always return the response to prevent the following error:
  // No result from middlewares - did you forget to `return next()`
  return res;
});

export const router = t.router;
export const procedure = t.procedure.use(logErrors);
export const protectedProcedure = t.procedure.use(isAuthed).use(logErrors);
export const mergeRouters = t.mergeRouters;
