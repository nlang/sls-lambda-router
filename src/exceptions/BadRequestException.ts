import {RouterException} from "./RouterException";

export class BadRequestException extends RouterException {
    constructor(message?: any, error?: Error) {
        message = message || "Bad Request";
        super(400, message, error);
    }
}
