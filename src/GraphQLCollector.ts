import graphqlFields from "graphql-fields";

import { GraphQLFieldHandler, GraphQLResolveInfo } from "./types";
import { handleFields } from "./utils";

export class GraphQLCollector<Ctx, R extends Record<string, any>> {
  constructor(private fieldHandler: GraphQLFieldHandler<Ctx, R>) {}

  collect(ctx: Ctx, info: GraphQLResolveInfo) {
    const fields = graphqlFields(info);

    return handleFields(ctx, this.fieldHandler, fields);
  }
}
