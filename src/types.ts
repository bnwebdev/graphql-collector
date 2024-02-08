import graphqlFields from "graphql-fields";

export type GraphQLPrimitiveType = null | number | string | boolean | Date;

export type GraphQLResolveInfo = Parameters<typeof graphqlFields>[0];

export type GraphQLFieldFnEndHandler<Context> = (context: Context) => void;

type ObjectType = Record<string | number | symbol, unknown>;

export type GraphQLFieldFnHandler<Context, RecordLike extends ObjectType> = {
  (context: Context): void | GraphQLFieldRecordHandler<Context, RecordLike>;
};

export type NonNullableValue<
  RecordLike extends ObjectType,
  Key extends string | number | symbol
> = NonNullable<RecordLike[Key]>;

export type ResolveHandlerType<Context, Type> = Type extends ObjectType[]
  ? GraphQLFieldHandler<Context, Type[number]>
  : Type extends unknown[]
  ? GraphQLFieldFnEndHandler<Context>
  : Type extends ObjectType
  ? GraphQLFieldHandler<Context, Type>
  : Type extends GraphQLPrimitiveType
  ? GraphQLFieldFnEndHandler<Context>
  : never;

export type GraphQLFieldRecordHandler<
  Context,
  RecordLike extends ObjectType
> = {
  [Key in keyof RecordLike]?: ResolveHandlerType<
    Context,
    NonNullableValue<RecordLike, Key>
  >;
};

export type GraphQLFieldHandler<
  Context,
  RecordLike extends Record<string, any>
> =
  | GraphQLFieldFnHandler<Context, RecordLike>
  | GraphQLFieldRecordHandler<Context, RecordLike>;
