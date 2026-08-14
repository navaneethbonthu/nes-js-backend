import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Response } from 'express';


@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {


    private readonly logger = new Logger(GlobalExceptionFilter.name);


    catch(exception: unknown, host: ArgumentsHost) {


        const context = host.switchToHttp()

        const response = context.getResponse<Response>()

        const request = context.getRequest<Request>()


        let status = HttpStatus.INTERNAL_SERVER_ERROR
        let message = 'Internal server error';

        // 1. Check if it is a NestJS HttpException (400, 401, 404, etc.)
        if (exception instanceof HttpException) {
            status = exception.getStatus()
            const res = exception.getResponse()
            message = typeof res === 'object' ? (res as any).message : res

        }
        // 2. Check if it is a standard JavaScript Error (Database crash, Logic error)
        else if (exception instanceof Error) {
            message = exception.message
        }


        const errorBody = {
            success: false,
            statusCode: status,
            timeStamp: new Date().toISOString(),
            path: request.url,
            message: Array.isArray(message) ? message[0] : message
        }



        const logMessage = `URL: ${request.url} | Status: ${status} | Message: ${JSON.stringify(message)}`

        // Log critical errors with Stack Trace
        if (status >= 500) {
            this.logger.error(logMessage, (exception as any).stack)
        } else if (status > 400) {
            this.logger.warn(logMessage)
        }

        response.status(status).json(errorBody);

    }


}