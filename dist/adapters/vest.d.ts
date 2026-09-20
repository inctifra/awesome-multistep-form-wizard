import { Validator } from '../core/types.js';
interface VestResult {
    hasErrors?: (field?: string) => boolean;
    getErrors?: (field?: string) => string[];
    errorCount?: number;
}
interface VestSuite<TValues> {
    run(data: TValues, options?: {
        signal?: AbortSignal;
    }): VestResult | Promise<VestResult>;
}
export interface VestValidatorOptions<TValues> {
    suite: VestSuite<TValues> | any;
    field?: string;
}
export declare function vestValidator<TValues>(options: VestValidatorOptions<TValues>): Validator<TValues>;
export {};
//# sourceMappingURL=vest.d.ts.map