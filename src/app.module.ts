import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database-config';
import { GuestModule } from './modules/guest/guest.module';
import { QrModule } from './modules/qr/qr.module';
import { DatabaseModule } from './shared/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [databaseConfig] }),
    DatabaseModule,
    GuestModule,
    QrModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
