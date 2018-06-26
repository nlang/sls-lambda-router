import {Result} from "route-recognizer";
import {IHandlerParamDecorator} from "./decorator/ApiGatewayInvokeDecorator";
import {IAuthorizer} from "./IAuthorizer";

export class Route {
    public handler: () => any;
    public signature: IHandlerParamDecorator[];
    public params: { [name: string]: string };
    public restriction: [IAuthorizer, string];

    constructor(routeMatch: Result) {
        this.handler = routeMatch.handler[0];
        this.signature = routeMatch.handler[1];
        this.params = routeMatch.params as { [name: string]: string };
        this.restriction = routeMatch.handler[2];
    }
}
