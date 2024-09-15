import { ZodSchema } from 'zod';
import { createValidationError } from './customErrors';

export const validationZodSchema = (schema : ZodSchema, data : unknown) : unknown => {
    const validationResult = schema.safeParse(data);
    if(!validationResult.success) throw createValidationError(validationResult.error.issues[0].message);
    return validationResult.data
}