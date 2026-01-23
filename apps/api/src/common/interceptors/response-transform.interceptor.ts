import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

export interface StandardResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    timestamp: string;
    requestId: string;
    path: string;
  };
}

export interface PaginatedResponse<T> extends StandardResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<
  T,
  StandardResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      map((data) => {
        // If data already has success property, it's already formatted
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Handle paginated responses
        if (
          data &&
          typeof data === 'object' &&
          'items' in data &&
          'total' in data
        ) {
          return {
            success: true,
            data: data.items,
            pagination: {
              page: data.page || 1,
              limit: data.limit || 10,
              total: data.total,
              totalPages: Math.ceil(data.total / (data.limit || 10)),
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId: request.requestId || 'unknown',
              path: request.url,
            },
          };
        }

        return {
          success: true,
          data,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: request.requestId || 'unknown',
            path: request.url,
          },
        };
      }),
    );
  }
}
