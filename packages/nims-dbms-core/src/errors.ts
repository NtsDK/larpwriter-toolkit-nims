/* eslint-disable prefer-rest-params */

// ((exports) => {
export class ValidationError extends Error {
  constructor(
    public messageId: string,
    public parameters: any[] = []
  ) {
    super(messageId);
    // this.messageId = messageId;
    // this.parameters = parameters || [];
    this.name = this.constructor.name;
  }
}

export class InternalError extends Error {
  constructor(
    public messageId: string,
    public parameters: any[] = []
  ) {
    super(messageId);
    // this.messageId = messageId;
    // this.parameters = parameters || [];
    this.name = this.constructor.name;
  }
}

// function ValidationError(messageId, parameters) {
//     Error.call(this, arguments);
//     this.name = 'ValidationError';

//     this.messageId = messageId;
//     this.parameters = parameters || [];

//     if (Error.captureStackTrace) {
//         Error.captureStackTrace(this, ValidationError);
//     } else {
//         this.stack = (new Error()).stack;
//     }
// }

// ValidationError.prototype = Object.create(Error.prototype);

// exports.ValidationError = ValidationError;

// function InternalError(messageId, parameters) {
//     Error.call(this, arguments);
//     this.name = 'InternalError';

//     this.messageId = messageId;
//     this.parameters = parameters;

//     if (Error.captureStackTrace) {
//         Error.captureStackTrace(this, InternalError);
//     } else {
//         this.stack = (new Error()).stack;
//     }
// }

// InternalError.prototype = Object.create(Error.prototype);

// exports.InternalError = InternalError;
// })(typeof exports === 'undefined' ? this.Errors = {} : exports);
