import {
  GraphQLFieldFnEndHandler,
  GraphQLFieldFnHandler,
  GraphQLFieldHandler,
  GraphQLPrimitiveType,
} from "../types";

export const Compose = <
  Ctx,
  T extends Record<string, any> | GraphQLPrimitiveType,
  Handler = T extends Record<string, any>
    ? GraphQLFieldHandler<Ctx, T>
    : GraphQLFieldFnEndHandler<Ctx>
>(
  ...handlers:
    | [Handler]
    | [GraphQLFieldFnEndHandler<Ctx>, Handler]
    | [GraphQLFieldFnEndHandler<Ctx>, GraphQLFieldFnEndHandler<Ctx>, Handler]
    | [
        GraphQLFieldFnEndHandler<Ctx>,
        GraphQLFieldFnEndHandler<Ctx>,
        GraphQLFieldFnEndHandler<Ctx>,
        Handler
      ]
    | Array<GraphQLFieldFnEndHandler<Ctx> | Handler>
): Handler => {
  const resultHandler = (context: Ctx) =>
    handlers
      .map((handler) =>
        typeof handler === "function"
          ? (handler as GraphQLFieldFnHandler<Ctx, any>)(context)
          : handler
      )
      .pop();

  return resultHandler as Handler;
};
