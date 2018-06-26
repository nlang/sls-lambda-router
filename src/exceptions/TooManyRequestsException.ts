import {RouterException} from "./RouterException";

export class TooManyRequestsException extends RouterException {
    constructor(message: any, error?: Error) {
        message = message || "Too Many Requests";
        super(429, message, error);
    }
}
