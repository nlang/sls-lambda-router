import {RouterException} from "./RouterException";

export class BadGatewayException extends RouterException {
    constructor(message: any, error?: Error) {
        message = message || "Bad Gateway";
        super(502, message, error);
    }
}
