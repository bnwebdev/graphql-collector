export type GraphQLCollectBaseContext = Record<string, unknown[]>;

export type GraphQLCollectContext<
  Extended extends GraphQLCollectBaseContext = {}
> = Extended & {
  select: string[];
  leftJoin: string[][];
};
