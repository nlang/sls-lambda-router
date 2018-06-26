import {RouterException} from "./RouterException";

export class InternalServerErrorException extends RouterException {
    constructor(message: any, error?: Error) {
        message = message || "Internal Server Error";
        super(500, message, error);
    }
}
