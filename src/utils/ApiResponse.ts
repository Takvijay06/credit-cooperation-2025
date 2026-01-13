import { errorMessages, StatusCode } from "../common/constant.js";

class ApiResponse {
  statusCode: number;
  data: null;
  success: boolean;
  message: string;
  constructor(statusCode: number, data: any, message: string = errorMessages.success) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < StatusCode.BADREQUEST;
  }
}

export { ApiResponse };
