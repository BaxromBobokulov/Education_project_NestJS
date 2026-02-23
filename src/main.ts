import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config  = new DocumentBuilder()
  .setTitle("Education project NestJS")
  .addBearerAuth()
  .build()

  const documentFactory = () => SwaggerModule.createDocument(app,config)
  SwaggerModule.setup("swagger",app,documentFactory)
  Logger.log("Swagger yo'nalishi 📍","http://localhost:3000/swagger#/")
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
