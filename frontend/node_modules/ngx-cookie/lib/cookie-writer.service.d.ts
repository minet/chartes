import { CookieOptions, ICookieWriterService } from './cookie.model';
export declare class CookieWriterService implements ICookieWriterService {
    private document;
    constructor(document: any);
    readAllAsString(): string;
    write(name: string, value: string | undefined, options?: CookieOptions): void;
}
