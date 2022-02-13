import { Injector } from '@angular/core';
import { CookieOptions } from './cookie.model';
export declare class CookieOptionsProvider {
    private injector;
    readonly options: CookieOptions;
    private readonly defaultOptions;
    constructor(options: CookieOptions | undefined, injector: Injector);
}
