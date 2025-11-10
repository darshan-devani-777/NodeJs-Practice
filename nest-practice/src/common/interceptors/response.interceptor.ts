import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  private readonly routeMessages = new Map<string, string>([
    ['POST:/users/create-user', 'User created successfully...'],
    ['POST:/users/login-user', 'User login successfully...'],
    ['GET:/users/get-all-users', 'Users retrieved successfully...'],
    ['GET:/users/get-specific-user/:id', 'User retrieved successfully...'],
    ['PATCH:/users/update-user/:id', 'User updated successfully...'],
    ['DELETE:/users/delete-user/:id', 'User deleted successfully...'],
  ]);

  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();

    const method = request.method;
    let routePath = `${request.baseUrl || ''}${request.route?.path || ''}` || request.url;
    routePath = routePath.replace(/^\/(api|v\d+)\b/, '');
    if (!routePath.startsWith('/')) {
      routePath = `/${routePath}`;
    }

    const message = this.getMessage(method, routePath);

    return next.handle().pipe(
      map((data: any) => {
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        return {
          success: true,
          message,
          data,
        };
      }),
    );
  }

  private getMessage(method: string, url: string): string {
    const specificKey = `${method}:${url}`;
    const specificMessage = this.routeMessages.get(specificKey);
    if (specificMessage) {
      return specificMessage;
    }

    switch (method) {
      case 'POST':
        return 'Request completed successfully';
      case 'GET':
        return url.includes(':id') ? 'Data retrieved successfully' : 'List retrieved successfully';
      case 'PATCH':
        return 'Changes applied successfully';
      case 'DELETE':
        return 'Deletion completed successfully';
      default:
        return 'Request successful';
    }
  }
}
