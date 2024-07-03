import {
  Controller,
  Post,
  Body,
  Delete,
  Param,
  Get,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerDocument } from './schema/customer.schema';
import * as xlsx from 'xlsx';
import * as csvParser from 'csv-parser';
import * as stream from 'stream';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) { }

  @Get('all')
  async getAll(): Promise<CustomerDocument[]> {
    return this.customerService.findAll();
  }

  @Get('find/:id')
  async getById(@Param('id') id: string): Promise<CustomerDocument> {
    return this.customerService.findById(id);
  }

  @Get('find/email')
  async getByEmail(@Body() email: string): Promise<CustomerDocument> {
    return this.customerService.findByEmail(email);
  }

  @Post('create')
  async create(@Body() createCustomerDto: CreateCustomerDto): Promise<CustomerDocument> {
    return this.customerService.create(createCustomerDto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any) {
    console.log('Uploaded file:', file);
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const customers: CreateCustomerDto[] = [];

    if (file.mimetype === 'text/csv') {
      // Handle CSV files
      const csvStream = new stream.PassThrough();
      csvStream.end(file.buffer);

      csvStream
        .pipe(csvParser({ headers: true }))
        .on('data', (row) => {
          customers.push({
            firstName: row.firstName,
            lastName: row.lastName,
            phoneNumber: row.phoneNumber,
            email: row.email,
          });
        })
        .on('end', async () => {
          await this.customerService.createBulk(customers);
        })
        .on('error', (err) => {
          throw new BadRequestException('Error processing CSV file');
        });
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      // Handle Excel files
      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(sheet);

      rows.forEach((row: any) => {
        customers.push({
          firstName: row.firstName,
          lastName: row.lastName,
          phoneNumber: row.phoneNumber,
          email: row.email,
        });
      });

      await this.customerService.createBulk(customers);
    } else {
      throw new BadRequestException('Invalid file format');
    }

    return { message: 'Customers onboarded successfully' };
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: string): Promise<CustomerDocument> {
    return this.customerService.delete(id);
  }
}
