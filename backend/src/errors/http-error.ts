export class HttpError extends Error {
    statusCode: number
    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.name = new.target.name;
    }
}

export class BadRequestError extends HttpError {
    constructor(message = "Bad request") {
        super(400, message);
    }
}

export class UnauthorizedError extends HttpError {
    constructor(message = "Unauthorized") {
        super(401, message);
    }
}

export class ForbiddenError extends HttpError {
    constructor(message = "Forbidden") {
        super(403, message);
    }
}

export class NotFoundError extends HttpError {
    constructor(message = "Resource not found") {
        super(404, message);
    }
}

export class ConflictError extends HttpError {
    constructor(message = "Conflict") {
        super(409, message);
    }
}