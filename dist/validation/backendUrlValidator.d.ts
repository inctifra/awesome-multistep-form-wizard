import { ValidationResult, Validator } from '../core/types.js';
export interface BackendRequestContext<TValues> {
    value: unknown;
    values: TValues;
    signal: AbortSignal;
}
export interface BackendUrlValidatorOptions<TValues> {
    url: string;
    method?: string;
    headers?: HeadersInit | ((context: BackendRequestContext<TValues>) => HeadersInit);
    body?: (context: BackendRequestContext<TValues>) => unknown;
    parseResponse?: (data: unknown, response: Response) => ValidationResult | Promise<ValidationResult>;
}
export declare function backendUrlValidator<TValues>(options: BackendUrlValidatorOptions<TValues>): Validator<TValues>;
//# sourceMappingURL=backendUrlValidator.d.ts.map