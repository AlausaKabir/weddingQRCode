import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { QrBadge } from 'src/modules/qr/schemas/qr.schema';

export type CustomerDocument = Customer & Document;

@Schema()
export class Customer {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ unique: true, lowercase: true })
  email: string;

  @Prop()
  phoneNumber: string;

  @Prop({ default: false })
  present: boolean;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'QrBadge' }],
  })
  qr_code_id?: Types.ObjectId[];
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
