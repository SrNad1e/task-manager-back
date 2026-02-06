import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

/**
 * Interceptor global que formatea todas las respuestas exitosas
 * Garantiza un formato consistente: { statusCode, message, data, timestamp }
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse<Response>();
    const statusCode = response.statusCode || HttpStatus.OK;

    return next.handle().pipe(
      map((data) => {
        // Si es un objeto con estructura de respuesta ya formateada, retornarla tal cual
        if (data && data.message && data.data !== undefined) {
          return data;
        }

        // Si es un array o un objeto simple, envolverlo
        const responseData: ApiResponse = {
          statusCode,
          message: this.getDefaultMessage(statusCode),
          data: data || null,
          timestamp: new Date().toISOString(),
        };

        return responseData;
      }),
    );
  }

  private getDefaultMessage(statusCode: number): string {
    const messages: Record<number, string> = {
      [HttpStatus.OK]: 'Success',
      [HttpStatus.CREATED]: 'Created successfully',
      [HttpStatus.ACCEPTED]: 'Accepted',
      [HttpStatus.NO_CONTENT]: 'No content',
    };

    return messages[statusCode] || 'Success';
  }
}
