import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>() as Request & { user?: any }; 

    const method = request.method;
    const routePath = request.originalUrl || request.url;
    const user = request.user ? request.user.email || request.user.id : 'Guest';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Something went wrong';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res: any = exception.getResponse();
      message = res?.message || exception.message || message;
      error = res?.error || exception.name || error;
    } else if (exception?.code === 11000) {
      status = HttpStatus.BAD_REQUEST;
      const field = Object.keys(exception.keyValue || {})[0];
      message = `User with this ${field} already exists`;
      error = 'Bad Request';
    } else if (exception?.message) {
      message = exception.message;
    }

    const stack = exception?.stack
      ? exception.stack.split('\n').slice(0, 5).join('\n')
      : '[No stack trace available]';

    const timestamp = new Date().toISOString();

    this.logger.error('------------------------------------------');
    this.logger.error(`❌ Exception Caught @ ${timestamp}`);
    this.logger.error(`Method      : ${method}`);
    this.logger.error(`Route       : ${routePath}`);
    this.logger.error(`User        : ${user}`);
    this.logger.error(`Status Code : ${status}`);
    this.logger.error(`Error Type  : ${error}`);
    this.logger.error(`Message     : ${message}`);
    this.logger.error(`Stack Trace :\n${stack}`);
    this.logger.error('------------------------------------------');

    response.status(status).json({
      success: false,
      message,
      error,
      data: null,
    });
  }
}
