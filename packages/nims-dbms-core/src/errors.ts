/*Copyright 2017 Timofey Rechkalov <ntsdk@yandex.ru>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
    limitations under the License. */

/* eslint-disable prefer-rest-params */

// ((exports) => {
export class ValidationError extends Error {
  constructor(public messageId: string, public parameters: any[] = []) {
    super(messageId);
    // this.messageId = messageId;
    // this.parameters = parameters || [];
    this.name = this.constructor.name;
  }
}

export class InternalError extends Error {
  constructor(public messageId: string, public parameters: any[] = []) {
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
