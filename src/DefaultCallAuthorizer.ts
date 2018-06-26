import {APIGatewayEvent, Context} from "aws-lambda";
import {IAuthorizer} from "./IAuthorizer";

export class DefaultCallAuthorizer implements IAuthorizer {

    public authorize(event: APIGatewayEvent, context: Context, handlerArgs?: any, endpointGroupOrId?: string): Promise<any> {
        return Promise.resolve(true);
    }
}
