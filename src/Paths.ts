import RouteRecognizer, {Results} from "route-recognizer";
import {IHandlerParamDecorator} from "./decorator/ApiGatewayInvokeDecorator";
import {HTTPVerb} from "./HTTPVerb";
import {Route} from "./Route";
import {IAuthorizer} from "./IAuthorizer";

export class Paths {
    private routeRecognizer = new RouteRecognizer();

    constructor(public verb: HTTPVerb) {
    }

    public add(path: string, handler: () => any, signature: IHandlerParamDecorator[], restriction: [IAuthorizer, string]): void {
        this.routeRecognizer.add([{
            handler: [handler, signature, restriction],
            path,
        }]);
    }

    public match(path: string): Route {
        const results: Results = this.routeRecognizer.recognize(path);
        if (results && results.length === 1) {
            return new Route(results[0]);
        }
        return null;
    }
}
