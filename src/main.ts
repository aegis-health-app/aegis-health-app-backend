import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'express';
import * as admin from 'firebase-admin';
async function bootstrap() {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use('/user/profile/image', json({ limit: '5mb' }));
  app.use(json({ limit: '100kb' }));
  const config = new DocumentBuilder()
    .setTitle('Aegis Health Application')
    .setDescription('Aegis Health API Application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/doc', app, document);

  await app.listen(process.env.PORT || 8080);
}
bootstrap();
