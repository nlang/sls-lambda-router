export class RouterException extends Error {
    constructor(public httpStatusCode: number, public message: any, public error?: Error) {
        super(message);
    }
}
