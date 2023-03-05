import { GraphQLCollectBaseContext } from "./types";

/**
 * @example
 * type Post {
 *   title: string
 *   content: string
 * }
 * const collector = new GraphQLCollector<CollectContext, Post>({
 *   title: Collect('select', ['post.title']),
 *   content: Collect('select', ['post.content'])
 * })
 *
 * const rootResolver = {
 *   Query {
 *     post(_parent, _args, _context, info) {
 *       const collection = collector.collect(new Map(), info)
 *
 *       const selects: string[] = [].concat(...collection.select)
 *
 *       return ORM.select(selects).execute()
 *     }
 *   }
 * }
 */
export const Collect =
  <Ctx extends GraphQLCollectBaseContext>(
    key: keyof Ctx,
    ...values: Ctx[typeof key]
  ) =>
  (ctx: Ctx) => {
    if (!(key in ctx)) {
      ctx[key] = [] as any;
    }

    ctx[key]?.push(...values);
  };
