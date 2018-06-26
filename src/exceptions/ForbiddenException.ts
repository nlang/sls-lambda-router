import {RouterException} from "./RouterException";

export class ForbiddenException extends RouterException {
    constructor(message: any, error?: Error) {
        message = message || "Forbidden";
        super(403, message, error);
    }
}
