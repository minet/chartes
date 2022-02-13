import { CookieDict, CookieOptions } from './cookie.model';
export declare function isNil(obj: any): boolean;
export declare function isPresent(obj: any): boolean;
export declare function isString(obj: any): obj is string;
export declare function isEmpty(value: any): boolean;
export declare function mergeOptions(oldOptions: CookieOptions, newOptions?: CookieOptions): CookieOptions;
export declare function parseCookieString(currentCookieString: string): CookieDict;
export declare function buildCookieString(name: string, value: string | undefined, options?: CookieOptions): string;
export declare function safeDecodeURIComponent(str: string): string;
