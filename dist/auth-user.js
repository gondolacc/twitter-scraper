"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwitterUserAuth = void 0;
const got_scraping_1 = require("got-scraping");
const auth_1 = require("./auth");
const api_1 = require("./api");
const tough_cookie_1 = require("tough-cookie");
/**
 * A user authentication token manager.
 */
class TwitterUserAuth extends auth_1.TwitterGuestAuth {
    constructor(bearerToken) {
        super(bearerToken);
    }
    isLoggedIn() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield (0, api_1.requestApi)('https://api.twitter.com/1.1/account/verify_credentials.json', this);
            if (!res.success) {
                return false;
            }
            const { value: verify } = res;
            return verify && !((_a = verify.errors) === null || _a === void 0 ? void 0 : _a.length);
        });
    }
    login(username, password, email) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateGuestToken();
            // Executes the potential acid step in the login flow
            const executeFlowAcid = (ft) => this.executeFlowTask({
                flow_token: ft,
                subtask_inputs: [
                    {
                        subtask_id: 'LoginAcid',
                        enter_text: {
                            text: email,
                            link: 'next_link',
                        },
                    },
                ],
            });
            // Handles the result of a flow task
            const handleFlowTokenResult = (p) => __awaiter(this, void 0, void 0, function* () {
                const result = yield p;
                const { status } = result;
                if (status === 'error') {
                    throw result.err;
                }
                else if (status === 'acid') {
                    return yield handleFlowTokenResult(executeFlowAcid(result.flowToken));
                }
                else {
                    return result.flowToken;
                }
            });
            // Executes a flow subtask and handles the result
            const executeFlowSubtask = (data) => handleFlowTokenResult(this.executeFlowTask(data));
            yield executeFlowSubtask({
                flow_name: 'login',
                input_flow_data: {
                    flow_context: {
                        debug_overrides: {},
                        start_location: {
                            location: 'splash_screen',
                        },
                    },
                },
            })
                .then((ft) => executeFlowSubtask({
                flow_token: ft,
                subtask_inputs: [
                    {
                        subtask_id: 'LoginJsInstrumentationSubtask',
                        js_instrumentation: {
                            response: '{}',
                            link: 'next_link',
                        },
                    },
                ],
            }))
                .then((ft) => executeFlowSubtask({
                flow_token: ft,
                subtask_inputs: [
                    {
                        subtask_id: 'LoginEnterUserIdentifierSSO',
                        settings_list: {
                            setting_responses: [
                                {
                                    key: 'user_identifier',
                                    response_data: {
                                        text_data: { result: username },
                                    },
                                },
                            ],
                            link: 'next_link',
                        },
                    },
                ],
            }))
                .then((ft) => executeFlowSubtask({
                flow_token: ft,
                subtask_inputs: [
                    {
                        subtask_id: 'LoginEnterPassword',
                        enter_password: {
                            password,
                            link: 'next_link',
                        },
                    },
                ],
            }))
                .then((ft) => executeFlowSubtask({
                flow_token: ft,
                subtask_inputs: [
                    {
                        subtask_id: 'AccountDuplicationCheck',
                        check_logged_in_account: {
                            link: 'AccountDuplicationCheck_false',
                        },
                    },
                ],
            }));
        });
    }
    logout() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isLoggedIn()) {
                return;
            }
            yield (0, api_1.requestApi)('https://api.twitter.com/1.1/account/logout.json', this, 'post');
            this.deleteToken();
            this.jar = new tough_cookie_1.CookieJar();
        });
    }
    installTo(headers, url) {
        return __awaiter(this, void 0, void 0, function* () {
            headers['authorization'] = `Bearer ${this.bearerToken}`;
            const cookies = yield this.jar.getCookies(url);
            const xCsrfToken = cookies.find((cookie) => cookie.key === 'ct0');
            if (xCsrfToken) {
                headers['x-csrf-token'] = xCsrfToken.value;
            }
        });
    }
    executeFlowTask(data) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const token = this.guestToken;
            if (token == null) {
                throw new Error('Authentication token is null or undefined.');
            }
            const res = yield got_scraping_1.gotScraping.post({
                url: 'https://api.twitter.com/1.1/onboarding/task.json',
                headers: {
                    authorization: `Bearer ${this.bearerToken}`,
                    'content-type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 11; Nokia G20) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.88 Mobile Safari/537.36',
                    'x-guest-token': token,
                    'x-twitter-auth-type': 'OAuth2Client',
                    'x-twitter-active-user': 'yes',
                    'x-twitter-client-language': 'en',
                },
                cookieJar: this.jar,
                json: data,
            });
            if (res.statusCode != 200) {
                return { status: 'error', err: new Error(res.body) };
            }
            const flow = JSON.parse(res.body);
            if ((flow === null || flow === void 0 ? void 0 : flow.flow_token) == null) {
                return { status: 'error', err: new Error('flow_token not found.') };
            }
            if ((_a = flow.errors) === null || _a === void 0 ? void 0 : _a.length) {
                return {
                    status: 'error',
                    err: new Error(`Authentication error (${flow.errors[0].code}): ${flow.errors[0].message}`),
                };
            }
            if (typeof flow.flow_token !== 'string') {
                return {
                    status: 'error',
                    err: new Error('flow_token was not a string.'),
                };
            }
            if ((_b = flow.subtasks) === null || _b === void 0 ? void 0 : _b.length) {
                if (flow.subtasks[0].subtask_id === 'LoginEnterAlternateIdentifierSubtask') {
                    return {
                        status: 'error',
                        err: new Error('Authentication error: LoginEnterAlternateIdentifierSubtask'),
                    };
                }
                else if (flow.subtasks[0].subtask_id === 'LoginAcid') {
                    return {
                        status: 'acid',
                        flowToken: flow.flow_token,
                    };
                }
            }
            return {
                status: 'success',
                flowToken: flow.flow_token,
            };
        });
    }
}
exports.TwitterUserAuth = TwitterUserAuth;
//# sourceMappingURL=auth-user.js.map