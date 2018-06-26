import {APIGatewayEvent, Context} from "aws-lambda";

export interface IAuthorizer {
    authorize(event: APIGatewayEvent, context: Context, handlerArgs?: any, endpointGroupOrId?: string): Promise<any>;
}
