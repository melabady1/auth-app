import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_doc, ret: any) => {
      delete ret.password;
      delete ret.__v;
      return ret;
    },
  },
})
export class User {
  @ApiProperty({ example: '64a1b2c3d4e5f6a7b8c9d0e1' })
  _id: string;

  @ApiProperty({ example: 'jane@example.com' })
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  email: string;

  @ApiProperty({ example: 'Jane Doe' })
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, select: false })
  password: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
