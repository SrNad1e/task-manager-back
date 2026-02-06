import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Types } from 'mongoose';

@Schema({
    timestamps: true,
})
export class Task {
    _id?: Types.ObjectId;
    @Prop({
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100,
    })
    title: string;

    @Prop({
        trim: true,
        maxlength: 500,
    })
    description: string;

    @Prop({ default: false })
    completed: boolean;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    user: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

TaskSchema.index({ user: 1, title: 1 }, { unique: true });