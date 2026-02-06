import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Permitir llamadas del front configurado por env
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  app.enableCors({
    origin: frontendUrl,
  });

  // Filtro global para excepciones
  app.useGlobalFilters(new AllExceptionsFilter());

  // Interceptor global para respuestas
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Configurar ValidationPipe global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configurar puerto y host
  const port = process.env.PORT || 3000;
  const host = process.env.HOST || 'localhost';

  try {
    await app.listen(port);
    logger.log(`✅ Servidor iniciado correctamente en http://${host}:${port}`, 'NestApplication');
    logger.log(`📚 Documentación disponible en http://${host}:${port}/api`, 'NestApplication');
  } catch (error) {
    logger.error(`❌ Error al iniciar el servidor: ${error.message}`, error.stack);
    process.exit(1);
  }
}
bootstrap();
