import { Response } from 'got-scraping';
export declare class ApiError<T> extends Error {
    readonly response: Response<T>;
    constructor(response: Response<T>, message: string);
}
//# sourceMappingURL=errors.d.ts.map