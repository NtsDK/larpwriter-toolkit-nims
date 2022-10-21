export class ValidationError extends Error {
    constructor(public messageId, public parameters = []) {
        super(messageId);
        this.name = this.constructor.name;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ValidationError);
        } else {
            this.stack = (new Error()).stack;
        }
    }
}

export class InternalError extends Error {
    constructor(public messageId, public parameters = []) {
        super(messageId);
        this.name = this.constructor.name;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ValidationError);
        } else {
            this.stack = (new Error()).stack;
        }
    }
}
