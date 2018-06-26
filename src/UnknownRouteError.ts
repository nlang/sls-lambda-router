import {APIGatewayEvent, Callback, Context} from "aws-lambda";
import {RoutingError} from "./RoutingError";

export class UnknownRouteError extends RoutingError {

    constructor(m: string, event: APIGatewayEvent, context: Context, callback: Callback) {
        super(m, event, context, callback);
    }
}
