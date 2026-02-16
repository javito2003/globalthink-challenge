import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as mongooseSchema } from 'mongoose';

export type ProfileDocument = HydratedDocument<Profile>;

@Schema({
  timestamps: true,
})
export class Profile {
  @Prop({
    required: true,
    unique: true,
    type: mongooseSchema.Types.ObjectId,
    ref: 'User',
  })
  userId: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop()
  bio: string;

  @Prop({ required: true })
  birthdate: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
