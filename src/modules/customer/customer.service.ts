import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomerDocument, Customer } from './schema/customer.schema';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { QrRepository } from '../qr/qr.repository';
import { CreateQrDto } from '../qr/dto/create-qr.dto';
import * as QRCode from 'qrcode';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    private readonly qrRepository: QrRepository,
    private readonly configService: ConfigService,
  ) { }

  async create(createCustomerDto: CreateCustomerDto): Promise<CustomerDocument> {
    const createdCustomer = new this.customerModel(createCustomerDto);
    const customer = await createdCustomer.save();
    const qrData = `${customer.firstName}-${customer.phoneNumber}`;
    const qrImage = await QRCode.toBuffer(qrData);
    const createQrDto: CreateQrDto = {
      data: qrData,
      customer_id: customer._id.toString(),
    };
    const qrBadge = await this.qrRepository.createQrCode(createQrDto);
    customer.qr_code_id = [qrBadge._id];
    await customer.save();
    await this.sendQrCodeEmail(customer.email, qrImage);
    return customer;
  }

  async createBulk(customers: CreateCustomerDto[]): Promise<void> {
    for (const createCustomerDto of customers) {
      await this.create(createCustomerDto);
    }
  }

  async findAll(): Promise<CustomerDocument[]> {
    return this.customerModel.find().exec();
  }

  async findById(id: string): Promise<CustomerDocument> {
    return this.customerModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<CustomerDocument> {
    return this.customerModel.findOne({ email }).exec();
  }

  async markAsPresent(id: string): Promise<CustomerDocument> {
    return this.customerModel.findByIdAndUpdate(id, { present: true }, { new: true });
  }

  async update(id: string, updateCustomerDto: CreateCustomerDto): Promise<CustomerDocument> {
    return this.customerModel.findByIdAndUpdate(id, updateCustomerDto, { new: true });
  }

  async delete(id: string): Promise<CustomerDocument> {
    return this.customerModel.findByIdAndRemove(id);
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
