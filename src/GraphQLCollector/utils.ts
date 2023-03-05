import { GraphQLFieldHandler } from "../types";

export const handleFields = <Ctx, R extends Record<string, unknown>>(
  ctx: Ctx,
  fieldHandler: GraphQLFieldHandler<Ctx, R>,
  fields: Record<string, any>
) => {
  const fieldRecordHandler =
    typeof fieldHandler === "function" ? fieldHandler(ctx) : fieldHandler;

  if (fieldRecordHandler) {
    Object.keys(fieldRecordHandler).forEach((key) => {
      const internalFieldHandler = fieldRecordHandler[
        key
      ] as GraphQLFieldHandler<Ctx, Record<string, any>>;

      if (key in fields) {
        handleFields(ctx, internalFieldHandler, fields[key]);
      }
    });
  }

  return ctx;
};
