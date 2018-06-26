import {RouterResourceRegistry} from "../RouterResourceRegistry";
import {IAuthorizer} from "../IAuthorizer";

export class ControlDecorator {

    public static Restricted(authorizer: IAuthorizer, enpointGroupOrId?: string) {
        return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
            RouterResourceRegistry.markRestricted(authorizer, target, propertyKey, enpointGroupOrId);
        };
    }
}
