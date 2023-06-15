import { TwitterGuestAuth } from './auth';
/**
 * A user authentication token manager.
 */
export declare class TwitterUserAuth extends TwitterGuestAuth {
    constructor(bearerToken: string);
    isLoggedIn(): Promise<boolean>;
    login(username: string, password: string, email?: string): Promise<void>;
    logout(): Promise<void>;
    installTo(headers: {
        [key: string]: unknown;
    }, url: string): Promise<void>;
    private executeFlowTask;
}
//# sourceMappingURL=auth-user.d.ts.map