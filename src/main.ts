import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const formatted = errors.reduce(
          (acc, err) => {
            const firstMsg = err.constraints
              ? Object.values(err.constraints)[0]
              : 'Valor inválido.';

            acc[err.property] = firstMsg;
            return acc;
          },
          {} as Record<string, string>,
        );

        return new BadRequestException({
          message: 'Dados inválidos.',
          errors: formatted,
        });
      },
    }),
  );
  app.setGlobalPrefix('api');
  app.enableCors();
  await app.listen(process.env.PORT || 3000);
}
bootstrap();