import {RouterException} from "./RouterException";

export class NotFoundException extends RouterException {
    constructor(message: any, error?: Error) {
        message = message || "Not Found";
        super(404, message, error);
    }
}
