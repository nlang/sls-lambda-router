import {APIGatewayEvent, Callback, Context} from "aws-lambda";
import {RouterResourceRegistry} from "../RouterResourceRegistry";

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
