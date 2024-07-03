import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { Customer, CustomerSchema } from './schema/customer.schema';
import { QrModule } from '../qr/qr.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Customer.name, schema: CustomerSchema }]),
    QrModule
  ],
  providers: [CustomerService],
  controllers: [CustomerController],

})
export class CustomerModule { }
