import {RouterException} from "./RouterException";

export class ImATeapotException extends RouterException {
    constructor(message: any, error?: Error) {
        message = message || "I'm a Teapot";
        super(418, message, error);
    }
}
