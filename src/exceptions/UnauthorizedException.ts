import {RouterException} from "./RouterException";

export class UnauthorizedException extends RouterException {
    constructor(message: any, error?: Error) {
        message = message || "Unauthorized";
        super(401, message, error);
    }
}
