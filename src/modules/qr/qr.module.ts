import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QrBadge, QrBadgeSchema } from './schemas/qr.schema';
import { QrRepository } from './qr.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: QrBadge.name, schema: QrBadgeSchema }]),
  ],
  providers: [QrRepository],
  exports: [QrRepository],
})
export class QrModule { }
