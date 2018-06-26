import {RouterException} from "./RouterException";

export class ServiceUnavailableException extends RouterException {
    constructor(message: any, error?: Error) {
        message = message || "Service Unavailable";
        super(503, message, error);
    }
}
