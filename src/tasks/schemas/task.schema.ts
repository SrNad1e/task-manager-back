import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema({
    timestamps: true,
})
export class Task {
    @Prop({
        required: true,
        unique: true,
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
}

export const TaskSchema = SchemaFactory.createForClass(Task);