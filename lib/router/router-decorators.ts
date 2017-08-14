import {APIGatewayEvent, Callback, Context} from "aws-lambda";
import {RouterResourceRegistry} from "./router";
import {HTTPVerb} from "./router";

export class HttpMethodDecorator {

    public static ANY(paths: string[]) {
        return HttpMethodDecorator.register.bind({paths, verb: HTTPVerb.ANY});
    }

    public static CONNECT(paths: string[]) {
        return HttpMethodDecorator.register.bind({paths, verb: HTTPVerb.CONNECT});
    }

    public static DELETE(paths: string[]) {
        return HttpMethodDecorator.register.bind({paths, verb: HTTPVerb.DELETE});
    }

    public static GET(paths: string[]) {
        return HttpMethodDecorator.register.bind({paths, verb: HTTPVerb.GET});
    }

    public static HEAD(paths: string[]) {
        return HttpMethodDecorator.register.bind({paths, verb: HTTPVerb.HEAD});
    }

    public static OPTIONS(paths: string[]) {
        return HttpMethodDecorator.register.bind({paths, verb: HTTPVerb.OPTIONS});
    }

    public static PATCH(paths: string[]) {
        return HttpMethodDecorator.register.bind({paths, verb: HTTPVerb.PATCH});
    }

    public static POST(paths: string[]) {
        return HttpMethodDecorator.register.bind({paths, verb: HTTPVerb.POST});
    }

    public static PUT(paths: string[]) {
        return HttpMethodDecorator.register.bind({paths, verb: HTTPVerb.PUT});
    }

    public static TRACE(paths: string[]) {
        return HttpMethodDecorator.register.bind({paths, verb: HTTPVerb.TRACE});
    }

    private static register(this: { paths: string[], verb: HTTPVerb },
                            target: any,
                            propertyKey: string) {
        RouterResourceRegistry.registerHandler(this.verb, this.paths, target, propertyKey);
    }
}
export const ANY = HttpMethodDecorator.ANY;
export const CONNECT = HttpMethodDecorator.CONNECT;
export const DELETE = HttpMethodDecorator.DELETE;
export const GET = HttpMethodDecorator.GET;
export const HEAD = HttpMethodDecorator.HEAD;
export const OPTIONS = HttpMethodDecorator.OPTIONS;
export const PATCH = HttpMethodDecorator.PATCH;
export const POST = HttpMethodDecorator.POST;
export const PUT = HttpMethodDecorator.PUT;
export const TRACE = HttpMethodDecorator.TRACE;

export interface IAuthorizer {
    authorize(event: APIGatewayEvent, context: Context, handlerArgs?: any): Promise<any>;
}

export class ControlDecorator {

    public static Restricted(authorizer: IAuthorizer) {
        return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
            RouterResourceRegistry.markRestricted(authorizer, target, propertyKey);
        };
    }
}

export interface IHandlerParamDecorator {

    target: any;
    propertyKey: string | symbol;
    parameterIndex: number;
    resolver: (event: APIGatewayEvent, context: Context, callback: Callback) => any;
}

export class ApiGatewayInvokeDecorator implements IHandlerParamDecorator {

    public static Callback(target: any, propertyKey: string | symbol, parameterIndex: number) {
        const resolver = (event: APIGatewayEvent, context: Context, callback: Callback) => {
            return callback;
        };
        const param = new ApiGatewayInvokeDecorator(target, propertyKey, parameterIndex, resolver);
        RouterResourceRegistry.registerParam(param);
    }

    public static Context(target: any, propertyKey: string | symbol, parameterIndex: number) {
        const resolver = (event: APIGatewayEvent, context: Context) => {
            return context;
        };
        const param = new ApiGatewayInvokeDecorator(target, propertyKey, parameterIndex, resolver);
        RouterResourceRegistry.registerParam(param);
    }

    public static Event(target: any, propertyKey: string | symbol, parameterIndex: number) {
        const resolver = (event: APIGatewayEvent) => {
            return event;
        };
        const param = new ApiGatewayInvokeDecorator(target, propertyKey, parameterIndex, resolver);
        RouterResourceRegistry.registerParam(param);
    }

    public static JsonBody(target: any, propertyKey: string | symbol, parameterIndex: number) {
        const resolver = (event: APIGatewayEvent) => {
            try {
                return JSON.parse(event.body);
            } catch (err) {
                // FIXME
                return null;
            }
        };
        const param = new ApiGatewayInvokeDecorator(target, propertyKey, parameterIndex, resolver);
        RouterResourceRegistry.registerParam(param);
    }

    public static PathParam(paramName: string) {
        return (target: any, propertyKey: string | symbol, parameterIndex: number) => {
            const resolver = (event: APIGatewayEvent, context: Context, callback: Callback) => {
                if (event.pathParameters) {
                    return event.pathParameters[paramName] || null;
                }
                return null;
            };
            const param = new ApiGatewayInvokeDecorator(target, propertyKey, parameterIndex, resolver);
            RouterResourceRegistry.registerParam(param);
        };
    }

    public static QueryParam(paramName: string) {
        return (target: any, propertyKey: string | symbol, parameterIndex: number) => {
            const resolver = (event: APIGatewayEvent) => {
                if (event.queryStringParameters) {
                    return event.queryStringParameters[paramName] || null;
                }
                return null;
            };
            const param = new ApiGatewayInvokeDecorator(target, propertyKey, parameterIndex, resolver);
            RouterResourceRegistry.registerParam(param);
        };
    }

    constructor(public target: any,
                public propertyKey: string | symbol,
                public parameterIndex: number,
                public resolver: (event: APIGatewayEvent, context: Context, callback: Callback) => any) {
    }
}
export const LambdaCallback = ApiGatewayInvokeDecorator.Callback;
export const LambdaContext = ApiGatewayInvokeDecorator.Context;
export const HttpEvent = ApiGatewayInvokeDecorator.Event;
export const JsonBody = ApiGatewayInvokeDecorator.JsonBody;
export const PathParam = ApiGatewayInvokeDecorator.PathParam;
export const QueryParam = ApiGatewayInvokeDecorator.QueryParam;
