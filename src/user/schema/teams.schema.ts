import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MemberStatus, UserStatus } from '../interface/user.enum';
import { Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'teams' })
export class Teams {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Business' })
  business: Types.ObjectId;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  phoneNumber: string;

  @Prop({ type: Boolean, default: false })
  emailVerified: boolean;

  @Prop({ type: Boolean, default: false })
  phoneNumberVerified: boolean;

  @Prop({
    type: String,
    required: true,
  })
  memberRole: string;

  @Prop({ type: String, required: true, default: MemberStatus.INACTIVE })
  accountStatus: string;

  @Prop({
    type: [String],
  })
  permissions: string[];
}

export const TeamSchema = SchemaFactory.createForClass(Teams);
