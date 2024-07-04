import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QrBadge, QrBadgeDocument } from './schemas/qr.schema';
import { CreateQrDto } from './dto/create-qr.dto';

@Injectable()
export class QrRepository {
  constructor(@InjectModel(QrBadge.name) private qrCodeModel: Model<QrBadgeDocument>) { }

  async createQrCode(createQrDto: CreateQrDto): Promise<QrBadgeDocument> {
    const createdQrCode = new this.qrCodeModel(createQrDto);
    return createdQrCode.save();
  }
}
