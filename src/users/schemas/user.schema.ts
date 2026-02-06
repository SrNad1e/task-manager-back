import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class User {
  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Validación de email
  })
  email: string;

  @Prop({
    required: true,
    minlength: 6, // Mínimo 6 caracteres hasheados
  })
  password: string;

  @Prop({ default: null })
  refreshToken?: string; // Para logout y refresh token
}

export const UserSchema = SchemaFactory.createForClass(User);
