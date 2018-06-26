import {APIGatewayEvent, Callback, Context} from "aws-lambda";

export class RoutingError extends Error {

    constructor(m: string, public event: APIGatewayEvent, public context: Context, public callback: Callback) {
        super(m);
    }
}
