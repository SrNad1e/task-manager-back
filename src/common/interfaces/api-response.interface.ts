/**
 * Interfaz estándar para todas las respuestas API
 * Garantiza consistencia en el formato de respuestas
 */
export interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  data?: T;
  timestamp?: string;
  path?: string;
}
