import { Collect } from "./Collect";
import { GraphQLCollectContext } from "./types";

export const Select = (...selects: string[]) =>
  Collect<Pick<GraphQLCollectContext, "select">>("select", ...selects);
