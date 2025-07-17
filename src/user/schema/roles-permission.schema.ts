import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

  

  @Schema({ timestamps: true, collection: 'permissions' })
  export class Permission {
    
    @Prop({ type: String, required: true, unique: true})
    name : string;

  }

  
  export const PermissionSchema = SchemaFactory.createForClass(Permission);



  @Schema({ timestamps: true, collection: 'roles' })
  export class Role {
    @Prop({ type: [{ type: Types.ObjectId, ref: Permission.name }] })
    permissions : Permission[];

    @Prop({ type: String, required: true, unique: true})
    name : string;

  }
  
  export const RoleSchema = SchemaFactory.createForClass(Role);
  










