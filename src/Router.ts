import {APIGatewayEvent, Callback, Context} from "aws-lambda";
import {IAuthorizer} from "./IAuthorizer";
import {DefaultCallAuthorizer} from "./DefaultCallAuthorizer";
import {RouterResourceRegistry} from "./RouterResourceRegistry";
import {HTTPVerb} from "./HTTPVerb";
import {IHandlerParamDecorator} from "./decorator/ApiGatewayInvokeDecorator";
import {UnknownRouteError} from "./UnknownRouteError";
import {Route} from "./Route";
import {RouterException} from "./exceptions/RouterException";
import {RoutingError} from "./RoutingError";
import {Paths} from "./Paths";
import * as _ from "lodash";
import {Response} from "./Response";

export class Router {

    public static getInstance(): Router {
        if (null === Router.$instance) {
            this.$instance = new Router();
        }
        return Router.$instance;
    }

    private static $instance: Router = null;
    private routes: object;
    private anyAuthorizer: IAuthorizer = new DefaultCallAuthorizer();
    private defaultAuthorizer: IAuthorizer;

    private constructor() {
        this.routes = {};
    }

    public setDefaultAuthorizer(authorizer: IAuthorizer, restrictedOnly: boolean = true): void {
        if (authorizer && !restrictedOnly) {
            this.anyAuthorizer = authorizer;
        } else if (restrictedOnly && !(this.anyAuthorizer instanceof DefaultCallAuthorizer)) {
            this.anyAuthorizer = new DefaultCallAuthorizer();
        }
        this.defaultAuthorizer = authorizer;
    }

    public registerResource(resource: any) {
        const registration = RouterResourceRegistry.find(resource);
        if (null !== registration) {
            for (const handler of registration.handlers) {
                const boundMethod = resource[handler.propertyKey].bind(resource);
                const signature = registration.params[handler.propertyKey];
                let restriction = null;
                if (registration.restrictions && registration.restrictions.hasOwnProperty(handler.propertyKey)) {
                    restriction = registration.restrictions[handler.propertyKey];
                    if (Array.isArray(restriction)) {
                        if (!restriction[0]) {
                            restriction[0] = this.defaultAuthorizer;
                        }
                    } else {
                        restriction = [this.defaultAuthorizer, null];
                    }
                }
                this.register(handler.verb, handler.path, boundMethod, signature, restriction);
            }
        }
    }

    public register(verb: HTTPVerb,
                    path: string,
                    handler: () => any,
                    signature: IHandlerParamDecorator[],
                    restriction: [IAuthorizer, string]): void {

        if (!restriction) {
            restriction = [this.anyAuthorizer, null];
        }
        this.getRoutes(verb, true).add(path, handler, signature, restriction);
    }

    public async route(event: APIGatewayEvent, context: Context, callback: Callback): Promise<any> {
        return new Promise((resolve, reject) => {
            const verb: HTTPVerb = HTTPVerb[event.httpMethod.toUpperCase()];
            const path: string = event.path;

            let routes = this.getRoutes(verb, false);
            if (null == routes) {
                routes = this.getRoutes(HTTPVerb.ANY, false);
                if (null == routes) {
                    throw new UnknownRouteError("Route not found", event, context, callback);
                }
            }

            let route: Route = routes.match(path);
            if (null == route && routes.verb !== HTTPVerb.ANY) {
                routes = this.getRoutes(HTTPVerb.ANY, false);
                if (null != routes) {
                    route = routes.match(path);
                }
            }

            if (null != route && typeof route.handler === "function") {
                try {
                    // explicitly named path parameters could be named differently in
                    // APIGW and route definitions. this allows the handler access them with
                    // any of the names
                    _.extend(event.pathParameters, route.params);
                    const args = this.buildArgsArray(route.signature, event, context, callback);
                    route.restriction[0].authorize(event, context, args, route.restriction[1]).then(() => {
                        let response;
                        try {
                            response = route.handler.apply(null, args);
                        } catch (err) {
                            if (err instanceof RouterException) {
                                response = new Response(err.httpStatusCode, err.message);
                            } else {
                                reject(err);
                                return;
                            }
                        }

                        if (response instanceof Response) {
                            resolve(this.sendResponse(callback, response));
                        } else if (response instanceof Promise) {
                            response.then((promisedResponse) => {
                                resolve(this.sendResponse(callback, promisedResponse));
                            }).catch((promisedError) => {
                                if (promisedError instanceof Response) {
                                    resolve(this.sendResponse(callback, promisedError));
                                } else if (promisedError instanceof RouterException) {
                                    resolve(this.sendResponse(
                                        callback,
                                        new Response(promisedError.httpStatusCode, promisedError.message),
                                    ));
                                } else {
                                    reject(promisedError);
                                }
                            });
                        } else {
                            resolve(response);
                        }
                    }).catch((authorizerResult) => {
                        if (authorizerResult instanceof Response) {
                            resolve(this.sendResponse(callback, authorizerResult));
                        } else {
                            reject(authorizerResult);
                        }
                    });
                } catch (err) {
                    throw new RoutingError(err.message, event, context, callback);
                }
            } else {
                throw new UnknownRouteError("Route not found", event, context, callback);
            }
        });
    }

    private buildArgsArray(signature: IHandlerParamDecorator[],
                           event: APIGatewayEvent,
                           context: Context,
                           callback: Callback): any[] {
        if (!signature) {
            return [event, context, callback];
        }
        return signature.map((param: IHandlerParamDecorator) => {
            return param.resolver(event, context, callback);
        });
    }

    private getRoutes(verb: HTTPVerb, create: boolean): Paths {
        const key: string = verb.valueOf().toString();
        if (!this.routes[key]) {
            if (create === true) {
                this.routes[key] = new Paths(verb);
            }
        }
        return this.routes[key];
    }

    private sendResponse(callback: Callback, response: Response): any {
        response.send(callback);
        return response;
    }
}
