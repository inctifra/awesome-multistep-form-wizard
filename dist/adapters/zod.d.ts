import { Validator } from '../core/types.js';
interface ZodLikeError {
    issues: Array<{
        path: PropertyKey[];
        message: string;
        code?: string;
    }>;
}
interface ZodLikeSchema<TValues> {
    safeParse(values: unknown): {
        success: true;
        data: TValues;
    } | {
        success: false;
        error: ZodLikeError;
    };
}
export interface ZodValidatorOptions<TValues> {
    schema: ZodLikeSchema<TValues>;
}
export declare function zodValidator<TValues>(options: ZodValidatorOptions<TValues>): Validator<TValues>;
export {};
//# sourceMappingURL=zod.d.ts.map