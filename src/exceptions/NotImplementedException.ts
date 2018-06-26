import {RouterException} from "./RouterException";

export class NotImplementedException extends RouterException {
    constructor(message: any, error?: Error) {
        message = message || "Not Implemented";
        super(501, message, error);
    }
}
