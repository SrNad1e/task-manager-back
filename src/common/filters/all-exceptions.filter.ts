import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

/**
 * Filtro de excepciones global
 * Intercepta todas las excepciones y las formatea de manera consistente
 * Proporciona logging automático de errores
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: any = null;

    // Manejo de HttpException
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Si la respuesta es un objeto, extraer mensaje
      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        details = (exceptionResponse as any).error;
      } else {
        message = exceptionResponse as string;
      }
    } else if (exception instanceof Error) {
      // Manejo de errores genéricos
      message = exception.message;
      details = exception.stack;
    }

    // Construir respuesta consistente
    const responseData: ApiResponse = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Logging
    const logMessage = `${request.method} ${request.url} - ${status} - ${message}`;

    if (status >= 500) {
      // Log de errores de servidor
      this.logger.error(logMessage, details);
    } else if (status >= 400) {
      // Log de errores de cliente
      this.logger.warn(logMessage);
    } else {
      this.logger.log(logMessage);
    }

    // Enviar respuesta
    response.status(status).json(responseData);
  }
}
