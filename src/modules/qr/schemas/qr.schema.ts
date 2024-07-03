import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QrBadgeDocument = QrBadge & Document;

@Schema()
export class QrBadge {
  @Prop({ required: true })
  data: string;

  @Prop({ required: true })
  customer_id: Types.ObjectId;

  @Prop()
  type: string;
}

export const QrBadgeSchema = SchemaFactory.createForClass(QrBadge);
