export class RouterException extends Error {
    constructor(public httpStatusCode: number, public message: any, public error?: Error) {
        super(message);
    }
}

export class BadRequestException extends RouterException {
    constructor(message?: any, error?: Error) {
        message = message || "Bad Request";
        super(400, message, error);
    }
}

export class UnauthorizedException extends RouterException {
    constructor(message: any, error?: Error) {
        message = message || "Unauthorized";
        super(401, message, error);
    }
}

export class ForbiddenException extends RouterException {
    constructor(message: any, error?: Error) {
        message = message || "Forbidden";
        super(403, message, error);
    }
}

export class NotFoundException extends RouterException {
    constructor(message: any, error?: Error) {
        message = message || "Not Found";
        super(404, message, error);
    }
}

export class MethodNotAllowedException extends RouterException {
    constructor(message: any, error?: Error) {
        message = message || "Method Not Allowed";
        super(405, message, error);
    }
}

export class ImATeapotException extends RouterException {
    constructor(message: any, error?: Error) {
        message = message || "I'm a Teapot";
        super(418, message, error);
    }
}

export class TooManyRequestsException extends RouterException {
    constructor(message: any, error?: Error) {
        message = message || "Too Many Requests";
        super(429, message, error);
    }
}

export class InternalServerErrorException extends RouterException {
    constructor(message: any, error?: Error) {
        message = message || "Internal Server Error";
        super(500, message, error);
    }
}

export class NotImplementedException extends RouterException {
    constructor(message: any, error?: Error) {
        message = message || "Not Implemented";
        super(501, message, error);
    }
}

export class BadGatewayException extends RouterException {
    constructor(message: any, error?: Error) {
        message = message || "Bad Gateway";
        super(502, message, error);
    }
}

export class ServiceUnavailableException extends RouterException {
    constructor(message: any, error?: Error) {
        message = message || "Service Unavailable";
        super(503, message, error);
    }
}
