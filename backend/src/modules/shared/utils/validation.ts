import { ZodSchema } from "zod";
import ErrorFactory from "./customErrors";

export const validationZodSchema = (
  schema: ZodSchema,
  data: unknown,
): unknown => {
  const validationResult = schema.safeParse(data);
  if (!validationResult.success)
    throw ErrorFactory.ValidationError(
      validationResult.error.issues[0].message,
    );
  return validationResult.data;
};
