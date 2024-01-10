import { ForbiddenError } from "apollo-server-express";

import type { LoggedInGraphQLContext } from "../../context";
import type { ResolverMiddleware } from "./middleware-types";

export const signedUpMiddleware: ResolverMiddleware<
  LoggedInGraphQLContext,
  any
> = (next) => (obj: any, args: any, ctx: LoggedInGraphQLContext, info: any) => {
  if (!ctx.user.isAccountSignupComplete) {
    throw new ForbiddenError(
      "You must complete the sign-up process to perform this action.",
    );
  }
  return next(obj, args, ctx, info);
};
