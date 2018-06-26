import {RouterException} from "./RouterException";

export class MethodNotAllowedException extends RouterException {
    constructor(message: any, error?: Error) {
        message = message || "Method Not Allowed";
        super(405, message, error);
    }
}
