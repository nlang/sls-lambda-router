import {HTTPVerb} from "./HTTPVerb";
import {IHandlerParamDecorator} from "./decorator/ApiGatewayInvokeDecorator";
import {IAuthorizer} from "./IAuthorizer";

export interface IRouterResourceRegistration {
    handlers: Array<{
        path: string,
        propertyKey: string,
        verb: HTTPVerb,
    }>;
    params: { [name: string]: IHandlerParamDecorator[] };
    restrictions: { [name: string]: [IAuthorizer, string] };
    target: object;
}

export class RouterResourceRegistry {

    public static registerHandler(verb: HTTPVerb, paths: string[], target: object, propertyKey: string): void {
        const registration = this.getRegistrationByTarget(target);
        for (const path of paths) {
            registration.handlers.push({path, propertyKey, verb});
        }
    }

    public static markRestricted(authorizer: IAuthorizer, target: object, propertyKey: string, endpointGroupOrId?: string): void {
        const registration = this.getRegistrationByTarget(target);
        registration.restrictions[propertyKey] = [authorizer, endpointGroupOrId];
    }

    public static registerParam(param: IHandlerParamDecorator): void {
        const registration = this.getRegistrationByTarget(param.target);
        registration.params[param.propertyKey as string] = registration.params[param.propertyKey as string] || [];
        registration.params[param.propertyKey as string][param.parameterIndex] = param;
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
