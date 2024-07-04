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
  Res,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { GuestService } from './guest.service';
import { CreateGuestDto } from './dto/create-guest.dto';
import { GuestDocument } from './schema/guest.schema';
import * as xlsx from 'xlsx';
import * as csvParser from 'csv-parser';
import * as stream from 'stream';

@Controller('guests')
export class GuestController {
  constructor(private readonly guestService: GuestService) { }

  @Get('all')
  async getAll(): Promise<GuestDocument[]> {
    return this.guestService.findAll();
  }

  @Get('find/:id')
  async getById(@Param('id') id: string): Promise<GuestDocument> {
    return this.guestService.findById(id);
  }

  @Get('find/email')
  async getByEmail(@Body() email: string): Promise<GuestDocument> {
    return this.guestService.findByEmail(email);
  }

  @Post('create')
  async create(@Body() createGuestDto: CreateGuestDto): Promise<GuestDocument> {
    return this.guestService.create(createGuestDto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any) {
    console.log('Uploaded file:', file);
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const guests: CreateGuestDto[] = [];

    if (file.mimetype === 'text/csv') {
      const csvStream = new stream.PassThrough();
      csvStream.end(file.buffer);

      csvStream
        .pipe(csvParser({ headers: true }))
        .on('data', (row) => {
          guests.push({
            firstName: row.firstName,
            lastName: row.lastName,
            phoneNumber: row.phoneNumber,
            email: row.email,
          });
        })
        .on('end', async () => {
          await this.guestService.createBulk(guests);
        })
        .on('error', (err) => {
          throw new BadRequestException('Error processing CSV file');
        });
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(sheet);

      rows.forEach((row: any) => {
        guests.push({
          firstName: row.firstName,
          lastName: row.lastName,
          phoneNumber: row.phoneNumber,
          email: row.email,
        });
      });

      await this.guestService.createBulk(guests);
    } else {
      throw new BadRequestException('Invalid file format');
    }

    return { message: 'Guests onboarded successfully' };
  }
  @Get('verify/:id')
  async verifyGuest(@Param('id') id: string, @Res() res: Response) {
    const guest = await this.guestService.findById(id);
    if (!guest) {
      throw new NotFoundException('Guest not found');
    }
    res.render('welcome', { guest });
  }
  @Delete('delete/:id')
  async delete(@Param('id') id: string): Promise<GuestDocument> {
    return this.guestService.delete(id);
  }
}
