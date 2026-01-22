import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

interface ErrorResponse {
    statusCode: number;
    message: string;
    error: string;
    timestamp: string;
    path: string;
    requestId?: string;
    details?: any;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const requestId = (request as any).requestId || 'unknown';

        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let error = 'Internal Server Error';
        let details: any = undefined;

        if (exception instanceof HttpException) {
            statusCode = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object') {
                const responseObj = exceptionResponse as any;
                message = responseObj.message || message;
                error = responseObj.error || exception.name;
                details = responseObj.details;
            }
        } else if (exception instanceof QueryFailedError) {
            statusCode = HttpStatus.BAD_REQUEST;
            message = 'Database query failed';
            error = 'Database Error';

            // Handle specific PostgreSQL errors
            const pgError = exception as any;
            if (pgError.code === '23505') {
                message = 'Duplicate entry detected';
                statusCode = HttpStatus.CONFLICT;
            } else if (pgError.code === '23503') {
                message = 'Referenced entity does not exist';
            } else if (pgError.code === '23502') {
                message = 'Required field is missing';
            }

            // Don't expose internal database details in production
            if (process.env.NODE_ENV !== 'production') {
                details = { code: pgError.code, detail: pgError.detail };
            }
        } else if (exception instanceof Error) {
            message = exception.message;
            error = exception.name;
        }

        const errorResponse: ErrorResponse = {
            statusCode,
            message,
            error,
            timestamp: new Date().toISOString(),
            path: request.url,
            requestId,
        };

        if (details && process.env.NODE_ENV !== 'production') {
            errorResponse.details = details;
        }

        // Log the error
        const logContext = {
            requestId,
            path: request.url,
            method: request.method,
            statusCode,
            userId: (request as any).user?.id,
            organizationId: (request as any).user?.organizationId,
        };

        if (statusCode >= 500) {
            this.logger.error(
                `[${requestId}] ${request.method} ${request.url} - ${statusCode}`,
                exception instanceof Error ? exception.stack : String(exception),
                logContext,
            );
        } else {
            this.logger.warn(
                `[${requestId}] ${request.method} ${request.url} - ${statusCode}: ${message}`,
                logContext,
            );
        }

        response.status(statusCode).json(errorResponse);
    }
}
