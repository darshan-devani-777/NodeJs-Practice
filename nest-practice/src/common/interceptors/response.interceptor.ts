import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  private readonly logger = new Logger(ResponseInterceptor.name);

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

    const controllerName = context.getClass().name;
    const handlerName = context.getHandler().name;

    const method = request.method;
    let routePath =
      `${request.baseUrl || ''}${request.route?.path || ''}` || request.url;
    routePath = routePath.replace(/^\/(api|v\d+)\b/, '');
    if (!routePath.startsWith('/')) routePath = `/${routePath}`;

    const message = this.getMessage(method, routePath);
    const user = request.user ? request.user.email || request.user.id : 'Guest';
    const startTime = Date.now();

    const cleanBody = this.filterSensitiveFields(request.body);
    const cleanQuery = this.filterSensitiveFields(request.query);
    const cleanParams = this.filterSensitiveFields(request.params);

    this.logger.log('------------------------------------------');
    this.logger.log('➡️  Incoming Request');
    this.logger.log(`Method      : ${method}`);
    this.logger.log(`Route       : ${routePath}`);
    this.logger.log(`Controller  : ${controllerName}`);
    this.logger.log(`Handler     : ${handlerName}`);
    this.logger.log(`User        : ${user}`);

    if (cleanParams && Object.keys(cleanParams).length)
      this.logger.log(`Params      : ${JSON.stringify(cleanParams, null, 2)}`);
    if (cleanQuery && Object.keys(cleanQuery).length)
      this.logger.log(`Query       : ${JSON.stringify(cleanQuery, null, 2)}`);
    if (cleanBody && Object.keys(cleanBody).length)
      this.logger.log(`Body        : ${JSON.stringify(cleanBody, null, 2)}`);

    this.logger.log('------------------------------------------');

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;

        const cleanResponse = this.filterSensitiveFields(
          this.toPlainObject(data),
        );
        const prettyResponse = this.prettyPrint(cleanResponse);

        this.logger.log('------------------------------------------');
        this.logger.log('✅ Request Completed');
        this.logger.log(`Method      : ${method}`);
        this.logger.log(`Route       : ${routePath}`);
        this.logger.log(`Duration    : ${duration}ms`);
        this.logger.log(`Response    : ${prettyResponse}`);
        this.logger.log('------------------------------------------');
      }),
      map((data: any) => {
        if (data && typeof data === 'object' && 'success' in data) return data;

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
    if (specificMessage) return specificMessage;

    switch (method) {
      case 'POST':
        return 'Request completed successfully';
      case 'GET':
        return url.includes(':id')
          ? 'Data retrieved successfully'
          : 'List retrieved successfully';
      case 'PATCH':
        return 'Changes applied successfully';
      case 'DELETE':
        return 'Deletion completed successfully';
      default:
        return 'Request successful';
    }
  }

  private toPlainObject(data: any): any {
    if (data == null) return data;

    if (typeof data.toObject === 'function') {
      return this.normalizeDocument(
        data.toObject({ getters: true, virtuals: false }),
      );
    }

    if (this.isObjectId(data)) {
      return data.toString();
    }

    if (data instanceof Date) {
      return data.toISOString();
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.toPlainObject(item));
    }

    if (typeof data === 'object') {
      const clean: any = {};
      for (const key in data) {
        if (!Object.prototype.hasOwnProperty.call(data, key)) continue;
        clean[key] = this.toPlainObject(data[key]);
      }
      return this.normalizeDocument(clean);
    }

    return data;
  }

  private normalizeDocument(doc: any): any {
    if (!doc || typeof doc !== 'object') return doc;
    const clean = { ...doc };

    if (clean._id) {
      clean.id = this.convertIdToString(clean._id);
      delete clean._id;
    }

    if (clean.id && typeof clean.id === 'object') {
      clean.id = this.convertIdToString(clean.id);
    }

    for (const key of Object.keys(clean)) {
      const val = clean[key];
      if (val instanceof Date) {
        clean[key] = val.toISOString();
      } else if (typeof val === 'object') {
        clean[key] = this.normalizeDocument(val);
      }
    }

    return clean;
  }

  private convertIdToString(id: any): string {
    try {
      if (!id) return '';

      if (this.isObjectId(id)) return id.toString();

      if (typeof id.toHexString === 'function') return id.toHexString();
      if (typeof id.toString === 'function' && !id.buffer) return id.toString();

      if (id.buffer && typeof id.buffer === 'object') {
        const bytes = Object.values(id.buffer);
        if (Array.isArray(bytes) && bytes.length === 12) {
          return Buffer.from(Uint8Array.from(bytes)).toString('hex');
        }
      }

      return String(id);
    } catch {
      return '[Invalid ObjectId]';
    }
  }

  private isObjectId(value: any): boolean {
    return (
      value &&
      typeof value === 'object' &&
      (value._bsontype === 'ObjectId' ||
        typeof value.toHexString === 'function' ||
        (value.id && typeof value.id === 'string'))
    );
  }

  private filterSensitiveFields(obj: any): any {
    if (obj === null || obj === undefined) return {};
    if (typeof obj !== 'object') return obj;

    const sensitiveKeys = [
      'password',
      'confirmPassword',
      'token',
      'accessToken',
      'refreshToken',
      'authorization',
      'auth',
      'secret',
    ];

    const clone: any = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

      const value = obj[key];
      if (sensitiveKeys.includes(key.toLowerCase())) {
        clone[key] = '[PROTECTED]';
      } else if (typeof value === 'object') {
        clone[key] = this.filterSensitiveFields(value);
      } else {
        clone[key] = value;
      }
    }

    return clone;
  }

  private prettyPrint(data: any): string {
    try {
      const json = JSON.stringify(data, null, 2);
      return json.length > 2000
        ? json.substring(0, 2000) + ' ... [truncated]'
        : json;
    } catch {
      return '[Unserializable Data]';
    }
  }
}
