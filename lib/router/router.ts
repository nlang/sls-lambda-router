import {APIGatewayEvent, Callback, Context} from "aws-lambda";
import * as _ from "lodash";
import {IAuthorizer, IHandlerParamDecorator} from "./router-decorators";
const RouteRecognizer = require("route-recognizer"); // tslint:disable-line:no-require-imports no-var-requires
import {Result} from "route-recognizer";
import {RouterException} from "./router-exceptions";

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

    public authorize(event: APIGatewayEvent, context: Context, handlerArgs?: any): Promise<any> {
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
            if (resource instanceof reg.target.constructor) {
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

export class Response {

    public static ok(body?: any, contentType?: string): Response {
        if (body) {
            const response = new Response(200, body);
            if (contentType) {
                response.setContentType(contentType);
            }
            return response;
        }
        return new Response(204);
    }

    public static created(body?: any, contentType?: string) {
        const response = new Response(201, body);
        if (contentType) {
            response.setContentType(contentType);
        }
        return response;
    }

    public static redirect(url: string) {
        return new Response(301, null, {
            Location: url,
        });
    }

    public static badRequest(message?: string, contentType?: string): Response {
        const response = new Response(400, message || "Bad Request");
        if (contentType) {
            response.setContentType(contentType);
        }
        return response;
    }

    public static unauthorized(message?: string, contentType?: string): Response {
        const response = new Response(401, message || "Unauthorized");
        if (contentType) {
            response.setContentType(contentType);
        }
        return response;
    }

    public static forbidden(message?: string, contentType?: string): Response {
        const response = new Response(403, message || "Forbidden");
        if (contentType) {
            response.setContentType(contentType);
        }
        return response;
    }

    public static notFound(message?: string, contentType?: string): Response {
        const response = new Response(404, message || "Not Found");
        if (contentType) {
            response.setContentType(contentType);
        }
        return response;
    }

    public static serverError(message?: string, contentType?: string): Response {
        const response = new Response(500, message || "Internal Server Error");
        if (contentType) {
            response.setContentType(contentType);
        }
        return response;
    }

    public static notImplemented(message?: string, contentType?: string): Response {
        const response = new Response(501, message || "Not Implemented");
        if (contentType) {
            response.setContentType(contentType);
        }
        return response;
    }

    constructor(private statusCode: number, private body?: any, private headers: { [key: string]: string } = {}) {
    }

    public setHeaders(headers: { [key: string]: string }): void {
        for (const header of Object.keys(headers)) {
            this.setHeader(header.toLowerCase(), headers[header]);
        }
    }

    public setHeader(key: string, value: string): void {
        if (_.isString(key)) {
            if (_.isNull(value) || _.isUndefined(value)) {
                delete this.headers[key];
            } else {
                this.headers[key.toLowerCase()] = value;
            }
        }
    }

    public getHeader(key: string): string {
        if (_.isString(key)) {
            return this.headers[key.toLowerCase()];
        }
        return null;
    }

    public setContentType(contentType: string) {
        this.setHeader("content-type", contentType);
    }

    public getContentType(): string {
        return this.getHeader("content-type");
    }

    public send(callback: Callback, contentType?: string) {
        if (!contentType) {
            contentType = this.getContentType();
        }
        if (!contentType) {

            if (_.isObject(this.body) || _.isArray(this.body)) {
                // assume json if body is array/object
                contentType = "application/json";
            } else {
                contentType = "text/plain";
            }
        }

        this.setContentType(contentType);
        switch (contentType.toUpperCase()) {
            case "application/json".toUpperCase():
                return this.sendJson(callback);

            default:
                return callback(null, {
                    body: this.body,
                    headers: this.headers,
                    statusCode: this.statusCode,
                });
        }
    }

    public sendJson(callback: Callback): any {

        let json = this.body;
        if (_.isObject(this.body) || _.isArray(this.body)) {
            json = JSON.stringify(this.body);
        }

        return callback(null, {
            body: json,
            headers: this.headers,
            statusCode: this.statusCode,
        });
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
    private anyAuthorizer: IAuthorizer = new AnyCallAuthorizer();
    private defaultAuthorizer: IAuthorizer;

    private constructor() {
        this.routes = {};
    }

    public setDefaultAuthorizer(authorizer: IAuthorizer, restrictedOnly: boolean = true): void {
        if (authorizer && !restrictedOnly) {
            this.anyAuthorizer = authorizer;
        } else if (restrictedOnly && !(this.anyAuthorizer instanceof AnyCallAuthorizer)) {
            this.anyAuthorizer = new AnyCallAuthorizer();
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
                    if (!restriction) {
                        restriction = this.defaultAuthorizer;
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
                    restriction: IAuthorizer): void {

        if (!restriction) {
            restriction = this.anyAuthorizer;
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
        return response.send(callback);
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
