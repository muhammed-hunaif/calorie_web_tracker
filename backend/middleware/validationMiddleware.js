import { z } from 'zod';

// Shared 400 shape for every server-side validation failure.
// `message` keeps the existing single-string contract the frontend already reads
// via error.response.data.message; `errors` adds the per-field breakdown.
const rejectInvalid = (res, error) =>
    res.status(400).json({
        message: error.issues?.[0]?.message || 'Invalid input',
        errors: z.flattenError(error),
    });

// Validates req.body. On success req.body is replaced with the parsed data, so
// unknown keys (e.g. a client-supplied "user_id") are stripped and can never
// reach a controller or an SQL statement.
export const validate = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            return rejectInvalid(res, result.error);
        }

        req.body = result.data;
        next();
    };
};

// Validates route params (e.g. :id, :date). Express 5 rebuilds req.params per
// router layer, so the coerced values are exposed on req.validatedParams.
export const validateParams = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.params);

        if (!result.success) {
            return rejectInvalid(res, result.error);
        }

        req.validatedParams = result.data;
        next();
    };
};

// Validates the query string. req.query is a read-only getter in Express 5,
// so the parsed value is exposed on req.validatedQuery instead.
export const validateQuery = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.query);

        if (!result.success) {
            return rejectInvalid(res, result.error);
        }

        req.validatedQuery = result.data;
        next();
    };
};
