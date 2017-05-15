import {APIGatewayEvent, Callback, Context} from "aws-lambda";
import * as _ from "lodash";
import {IAuthorizer, IHandlerParamDecorator} from "./router-decorators";
const RouteRecognizer = require("route-recognizer"); // tslint:disable-line:no-require-imports no-var-requires
import {Result} from "route-recognizer";

export enum HTTPVerb {
    ANY, CONNECT, DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT, TRACE,
}

class Route {
    public handler: () => any;
    public signature: IHandlerParamDecorator[];
    public params: { [name: string]: string };
    public restriction: IAuthorizer;

    constructor(routeMatch: Result) {
        this.handler = routeMatch.handler[0];
        this.signature = routeMatch.handler[1];
        this.params = routeMatch.params as { [name: string]: string };
        this.restriction = routeMatch.handler[2];
    }
}

class Paths {
    private routeRecognizer = new RouteRecognizer();

    constructor(public verb: HTTPVerb) {
    }

    public add(path: string, handler: () => any, signature: IHandlerParamDecorator[], restriction: IAuthorizer): void {
        this.routeRecognizer.add([{
            handler: [handler, signature, restriction],
            path,
        }]);
    }

    public match(path: string): Route {
        const results: Result[] = this.routeRecognizer.recognize(path);
        if (results && results.length === 1) {
            return new Route(results[0]);
        }
        return null;
    }
}

class AnyCallAuthorizer implements IAuthorizer {

    public authorize(event: APIGatewayEvent, context: Context, handlerArgs?: any): Promise<boolean> {
        return new Promise((res) => {
            res(true);
        });
    }
}

export interface IRouterResourceRegistration {
    handlers: Array<{
        path: string,
        propertyKey: string,
        verb: HTTPVerb,
    }>;
    params: { [name: string]: IHandlerParamDecorator[] };
    restrictions: { [name: string]: IAuthorizer };
    target: object;
}

export class RouterResourceRegistry {

    public static registerHandler(verb: HTTPVerb, paths: string[], target: object, propertyKey: string): void {
        const registration = this.getRegistrationByTarget(target);
        for (const path of paths) {
            registration.handlers.push({path, propertyKey, verb});
        }
    }

    public static markRestricted(authorizer: IAuthorizer, target: object, propertyKey: string): void {
        const registration = this.getRegistrationByTarget(target);
        registration.restrictions[propertyKey] = authorizer;
    }

    public static registerParam(param: IHandlerParamDecorator): void {
        const registration = this.getRegistrationByTarget(param.target);
        registration.params[param.propertyKey] = registration.params[param.propertyKey] || [];
        registration.params[param.propertyKey][param.parameterIndex] = param;
    }

    public static find(resource: object): IRouterResourceRegistration {
        for (const reg of this.registrations) {
            if (resource instanceof reg.constructor) {
                return reg;
            }
        }
        return null;
    }

    private static registrations: IRouterResourceRegistration[] = [];

    private static getRegistrationByTarget(target: object): IRouterResourceRegistration {
        let registration = null;
        for (const reg of this.registrations) {
            if (reg.target === target) {
                registration = reg;
                break;
            }
        }
        if (!registration) {
            registration = {
                handlers: [],
                params: {},
                restrictions: {},
                target,
            };
            this.registrations.push(registration);
        }
        return registration;
    }
}

export class Router {

    public static getInstance(): Router {
        if (null === Router.$instance) {
            this.$instance = new Router();
        }
        return Router.$instance;
    }

    private static $instance: Router = null;
    private routes: object;

    private constructor() {
        this.routes = {};
    }

    public registerResource(resource: any) {
        const registration = RouterResourceRegistry.find(resource);
        if (null !== registration) {
            for (const handler of registration.handlers) {
                const boundMethod = resource[handler.propertyKey].bind(resource);
                const signature = registration.params[handler.propertyKey];
                const restriction = registration.restrictions[handler.propertyKey];
                this.register(handler.verb, handler.path, boundMethod, signature, restriction);
            }
        }
    }

    public register(verb: HTTPVerb,
                    path: string,
                    handler: () => any,
                    signature: IHandlerParamDecorator[],
                    restriction: IAuthorizer): void {

        if (!restriction) {
            restriction = new AnyCallAuthorizer();
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

                    route.restriction.authorize(event, context, args).then(() => {
                        const res = route.handler.apply(null, args);
                        resolve(res);
                    }).catch((err) => {
                        reject(err);
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
}

export class RoutingError extends Error {

    constructor(m: string, public event: APIGatewayEvent, public context: Context, public callback: Callback) {
        super(m);
    }
}

export class UnknownRouteError extends RoutingError {

    constructor(m: string, event: APIGatewayEvent, context: Context, callback: Callback) {
        super(m, event, context, callback);
    }
}
