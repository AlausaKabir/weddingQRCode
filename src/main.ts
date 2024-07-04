import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

const Port = process.env.PORT || 3000;

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.setBaseViewsDir(join(__dirname, '..', 'views'));
    app.setViewEngine('hbs');

    await app.listen(Port);
    console.log(`Application is running on port ${Port}`);
  } catch (error) {
    console.error('Failed to start the server', error);
    process.exit(1);
  }
}

bootstrap();
