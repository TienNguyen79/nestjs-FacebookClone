import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type PasswordResetDocument = HydratedDocument<PasswordReset>;

@Schema({ timestamps: true })
export class PasswordReset {
  @Prop({ required: true })
  user: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true }) // biểu hiện cho thuộc tính
  code: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updateAt: Date;

  @Prop()
  isDeleted: boolean;

  @Prop()
  deleteAt: Date;
}

export const PasswordResetSchema = SchemaFactory.createForClass(PasswordReset);
