import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
    private readonly logger = new Logger('HTTP');

    use(req: Request, res: Response, next: NextFunction) {
        const { method, originalUrl, ip } = req;
        const userAgent = req.get('user-agent') || '';
        const requestId = req.requestId || 'unknown';
        const startTime = Date.now();

        // Log request
        this.logger.log(
            `[${requestId}] --> ${method} ${originalUrl} - IP: ${ip} - UA: ${userAgent.substring(0, 50)}`,
        );

        // Capture response
        res.on('finish', () => {
            const { statusCode } = res;
            const contentLength = res.get('content-length') || 0;
            const duration = Date.now() - startTime;
            const userId = (req as any).user?.id || 'anonymous';

            const logMessage = `[${requestId}] <-- ${method} ${originalUrl} - ${statusCode} - ${contentLength}bytes - ${duration}ms - User: ${userId}`;

            if (statusCode >= 500) {
                this.logger.error(logMessage);
            } else if (statusCode >= 400) {
                this.logger.warn(logMessage);
            } else {
                this.logger.log(logMessage);
            }
        });

        next();
    }
}
