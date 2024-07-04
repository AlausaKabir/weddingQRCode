import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GuestDocument, Guest } from './schema/guest.schema';
import { CreateGuestDto } from './dto/create-guest.dto';
import { QrRepository } from '../qr/qr.repository';
import { CreateQrDto } from '../qr/dto/create-qr.dto';
import * as QRCode from 'qrcode';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GuestService {
  constructor(
    @InjectModel(Guest.name) private guestModel: Model<GuestDocument>,
    private readonly qrRepository: QrRepository,
    private readonly configService: ConfigService,
  ) { }

  async create(createGuestDto: CreateGuestDto): Promise<GuestDocument> {
    const createdGuest = new this.guestModel(createGuestDto);
    const guest = await createdGuest.save();
    const qrData = `https://d73c-102-89-32-252.ngrok-free.app/guests/verify/${guest._id}`;
    const qrImage = await QRCode.toBuffer(qrData);
    const createQrDto: CreateQrDto = {
      data: qrData,
      guest_id: guest._id.toString(),
    };
    const qrBadge = await this.qrRepository.createQrCode(createQrDto);
    guest.qr_code_id = [qrBadge._id];
    await guest.save();
    await this.sendQrCodeEmail(guest.email, qrImage);
    return guest;
  }

  async createBulk(guest: CreateGuestDto[]): Promise<void> {
    for (const createGuestDto of guest) {
      await this.create(createGuestDto);
    }
  }

  async findAll(): Promise<GuestDocument[]> {
    return this.guestModel.find().exec();
  }

  async findById(id: string): Promise<GuestDocument> {
    return this.guestModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<GuestDocument> {
    return this.guestModel.findOne({ email }).exec();
  }

  async markAsPresent(id: string): Promise<GuestDocument> {
    return this.guestModel.findByIdAndUpdate(id, { present: true }, { new: true });
  }

  async update(id: string, updateGuestDto: CreateGuestDto): Promise<GuestDocument> {
    return this.guestModel.findByIdAndUpdate(id, updateGuestDto, { new: true });
  }

  async delete(id: string): Promise<GuestDocument> {
    return this.guestModel.findByIdAndRemove(id);
  }

  private async sendQrCodeEmail(email: string, qrImage: Buffer) {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      port: 465,
      secure: true,
      host: 'smtp.gmail.com',
      auth: {
        user: this.configService.get('NODEMAILER_EMAIL'),
        pass: this.configService.get('NODEMAILER_PASS'),
      },
    });
    await transporter.sendMail({
      from: 'nodemailer',
      to: email,
      subject: 'Welcome to the Event',
      text: 'Welcome to the event! Please find your QR code attached.',
      attachments: [
        {
          filename: 'qr-code.png',
          content: qrImage,
        },
      ],
    });
  }
}
