import graphqlFields from "graphql-fields";

type GraphQLPrimitiveType = null | number | string | boolean | Date;

export type GraphQLResolveInfo = Parameters<typeof graphqlFields>[0];

export type GraphQLFieldFnHandler<Ctx, R extends Record<string, any>> = {
  (ctx: Ctx): void | GraphQLFieldRecordHandler<Ctx, R>;
};

export type GraphQLFieldRecordHandler<Ctx, R extends Record<string, any>> = {
  [Key in keyof R]?: R[Key] extends Record<string, unknown>
    ? GraphQLFieldHandler<Ctx, R[Key]>
    : R[Key] extends GraphQLPrimitiveType
    ? GraphQLFieldFnHandler<Ctx, R[Key]>
    : never;
};

export type GraphQLFieldHandler<Ctx, R extends Record<string, any>> =
  | GraphQLFieldFnHandler<Ctx, R>
  | GraphQLFieldRecordHandler<Ctx, R>;
