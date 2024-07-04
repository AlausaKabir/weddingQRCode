import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GuestController } from './guest.controller';
import { GuestService } from './guest.service';
import { Guest, GuestSchema } from './schema/guest.schema';
import { QrModule } from '../qr/qr.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Guest.name, schema: GuestSchema }]),
    QrModule
  ],
  providers: [GuestService],
  controllers: [GuestController],

})
export class GuestModule { }
