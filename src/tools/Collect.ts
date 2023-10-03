import { GraphQLCollectBaseContext } from "./types";

/**
 * @example
 * type Post {
 *   title: string
 *   content: string
 * }
 *
 * const collector = new GraphQLCollector<{ select: string[] }, Post>({
 *   title: Collect('select', 'post.title'),
 *   content: Collect('select', 'post.content')
 * })
 *
 * const rootResolver = {
 *   Query {
 *     post(_parent, _args, _context, info) {
 *       const { select } = collector.collect({ select: [] }, info)
 *
 *       return ORM.select(select).execute()
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
