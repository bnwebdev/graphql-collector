import graphqlFields from "graphql-fields";

import { handleFields } from "./utils";
import { GraphQLFieldHandler, GraphQLResolveInfo } from "../types";

export class GraphQLCollector<Ctx, R extends Record<string, any>> {
  constructor(private fieldHandler: GraphQLFieldHandler<Ctx, R>) {}

  collect(ctx: Ctx, info: GraphQLResolveInfo) {
    const fields = graphqlFields(info);

    return handleFields(ctx, this.fieldHandler, fields);
  }
}
