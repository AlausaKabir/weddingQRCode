import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { CreateQrDto } from './dto/create-qr.dto';
import { QrRepository } from './qr.repository';
import { validate } from 'class-validator';

@Controller('qr')
export class QrController {
  constructor(private readonly qrRepository: QrRepository) { }

  @Post('/generate')
  async generateQrCode(@Body() createQrDto: CreateQrDto) {
    const errors = await validate(createQrDto);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const qrCode = await this.qrRepository.createQrCode(createQrDto);
    return qrCode;
  }

}
