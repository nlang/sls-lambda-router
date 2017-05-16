import {APIGatewayEvent} from "aws-lambda";

export class Helpers {

    public static createApiGwEvent(verb: string,
                                   path: string,
                                   queryString: string,
                                   body: string,
                                   headers: object): APIGatewayEvent {
        return {
            body,
            headers: headers || {},
            httpMethod: verb,
            isBase64Encoded: false,
            path,
            pathParameters: {},
            queryStringParameters: this.parseQueryString(queryString),
            requestContext: null,
            resource: "",
            stageVariables: {},
        } as APIGatewayEvent;
    }

    public static parseQueryString(queryString: string) {
        const queryStringParameters = {};
        if (queryString) {
            if (queryString.startsWith("?")) {
                queryString = queryString.substring(1);
            }
            const vars = queryString.split("&");
            for (const pair of vars) {
                const kv = pair.split("=");
                queryStringParameters[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
            }
        }
        return queryStringParameters;
    }
}
