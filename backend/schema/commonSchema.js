import { z } from 'zod';

// MySQL signed INT upper bound - every id column in this schema is INT.
export const MAX_INT = 2147483647;

// Shared business limits, kept in one place so body/param validation agree.
export const MAX_QUANTITY = 10000;      // food_entries.quantity
export const MAX_DURATION = 10000;      // exercise_entries.duration
export const MAX_CALORIES = 10000;      // *_master calories per unit

export const idSchema = (label = 'ID') =>
    z.coerce
        .number(`${label} must be a number`)
        .int(`${label} must be an integer`)
        .positive(`${label} must be a positive integer`)
        .max(MAX_INT, `${label} is out of range`);

// :id route param (arrives as a string, coerced to a positive integer).
export const idParamSchema = z.object({
    id: idSchema('ID'),
});

// :date route param on /api/reports/:date - must be a real YYYY-MM-DD date.
export const dateParamSchema = z.object({
    date: z.iso.date('Date must be a valid date in YYYY-MM-DD format'),
});

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------
export const DEFAULT_PAGE_LIMIT = 10;
export const MAX_PAGE_LIMIT = 100;

// A missing or empty query value falls back to the default instead of being a
// validation error, so `?page=` from an empty input still works.
const pageNumber = (fallback, min, max, label) =>
    z.preprocess(
        (value) => (value === '' || value === undefined ? fallback : value),
        z.coerce
            .number(`${label} must be a number`)
            .int(`${label} must be an integer`)
            .min(min, `${label} must be at least ${min}`)
            .max(max, `${label} must not exceed ${max}`)
    );

const paginationFields = {
    page: pageNumber(1, 1, 100000, 'Page'),
    limit: pageNumber(DEFAULT_PAGE_LIMIT, 1, MAX_PAGE_LIMIT, 'Limit'),
    // Escape hatch for the entry-page dropdowns, which need every master row
    // rather than one page of them. Still scoped to the authenticated user.
    all: z
        .enum(['true', 'false'], { error: 'all must be "true" or "false"' })
        .optional()
        .transform((value) => value === 'true'),
};

export const paginationSchema = z.object(paginationFields);

// Pagination plus the optional date range filter on /api/reports.
export const reportQuerySchema = z
    .object({
        ...paginationFields,
        fromDate: z.iso.date('From date must be a valid date in YYYY-MM-DD format').optional(),
        toDate: z.iso.date('To date must be a valid date in YYYY-MM-DD format').optional(),
    })
    .refine((data) => Boolean(data.fromDate) === Boolean(data.toDate), {
        message: 'Both fromDate and toDate must be provided together',
        path: ['fromDate'],
    })
    .refine((data) => !data.fromDate || !data.toDate || data.fromDate <= data.toDate, {
        message: 'fromDate must be earlier than or equal to toDate',
        path: ['fromDate'],
    });

// Builds the { data, total, page, limit, totalPages } envelope every paginated
// endpoint returns.
export const buildPage = (data, total, page, limit) => ({
    data,
    total,
    page,
    limit,
    totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
});
