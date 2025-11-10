import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Something went wrong';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res: any = exception.getResponse();
      message = res.message || exception.message;
      error = res.error || exception.name;
    }
    else if (exception?.code === 11000) {
      status = HttpStatus.BAD_REQUEST;
      const field = Object.keys(exception.keyValue)[0];
      message = `User with this ${field} already exists`;
      error = 'Bad Request';
    }
    else if (exception?.message) {
      message = exception.message;
    }

    response.status(status).json({
      success: false,
      message,
      error,
      data: null,
    });
  }
}
