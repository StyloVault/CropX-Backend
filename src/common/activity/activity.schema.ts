import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";



@Schema({timestamps: true, collection:'activity'})
export class Activity {

    @Prop({type: String})
    businessId: string;
 
    @Prop({ type: String })
    description : string

    @Prop({type: String})
    createdById: string;

    @Prop({type: String})
    updatedById: string;

    @Prop({type : Object}) 
    payload : object
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);


ActivitySchema.set('toObject', { getters: true });
ActivitySchema.set('toJSON', { getters: true });