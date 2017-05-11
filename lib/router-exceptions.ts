export class RouterException extends Error {
    constructor(public httpStatusCode: number, public message: any, public error?: Error) {
        super(message);
    }
}

export class BadRequestException extends RouterException {
    constructor(message: any, error?: Error) {
        super(400, message, error);
    }
}

export class UnauthorizedException extends RouterException {
    constructor(message: any, error?: Error) {
        super(401, message, error);
    }
}

export class ForbiddenException extends RouterException {
    constructor(message: any, error?: Error) {
        super(403, message, error);
    }
}

export class NotFoundException extends RouterException {
    constructor(message: any, error?: Error) {
        super(404, message, error);
    }
}

export class MethodNotAllowedException extends RouterException {
    constructor(message: any, error?: Error) {
        super(405, message, error);
    }
}

export class ImATeapotException extends RouterException {
    constructor(message: any, error?: Error) {
        super(418, message, error);
    }
}

export class TooManyRequestsException extends RouterException {
    constructor(message: any, error?: Error) {
        super(429, message, error);
    }
}

export class InternalServerErrorException extends RouterException {
    constructor(message: any, error?: Error) {
        super(500, message, error);
    }
}

export class NotImplementedException extends RouterException {
    constructor(message: any, error?: Error) {
        super(501, message, error);
    }
}

export class BadGatewayException extends RouterException {
    constructor(message: any, error?: Error) {
        super(502, message, error);
    }
}

export class ServiceUnavailableException extends RouterException {
    constructor(message: any, error?: Error) {
        super(503, message, error);
    }
}
