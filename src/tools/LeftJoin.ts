import { Collect } from "./Collect";
import { GraphQLCollectContext } from "./types";

export const LeftJoin = (...joins: string[]) =>
  Collect<Pick<GraphQLCollectContext, "leftJoin">>("leftJoin", joins);
